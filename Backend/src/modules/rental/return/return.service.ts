import { prisma } from "../../../../prisma/client";

export const processReturn = async (
  rentalId: string,
  data: {
    condition:
      | "GOOD"
      | "DAMAGED"
      | "MISSING_ACCESSORIES"
      | "REPAIR_REQUIRED";

    damageNotes?: string;
    missingAccessories?: string;
    notes?: string;
  }
) => {
  return prisma.$transaction(async (tx) => {
    const rental = await tx.rental.findUnique({
      where: {
        id: rentalId,
      },
    });

    if (!rental) {
      throw new Error("Rental not found");
    }

    const now = new Date();

    let lateByMinutes = 0;

    if (now > rental.endDate) {
      lateByMinutes = Math.floor(
        (now.getTime() - rental.endDate.getTime()) /
          (1000 * 60)
      );
    }

    const organizationSettings =
      await tx.organizationSettings.findUnique({
        where: {
          organizationId:
            rental.organizationId,
        },
      });

    let lateFee = 0;

    if (
      organizationSettings?.lateFeeEnabled &&
      lateByMinutes > organizationSettings.gracePeriodMinutes
    ) {
      const lateMinutes =
        lateByMinutes -
        organizationSettings.gracePeriodMinutes;

      switch (organizationSettings.lateFeeType) {
        case "HOURLY":
          lateFee =
            Math.ceil(lateMinutes / 60) *
            Number(organizationSettings.lateFeeValue);
          break;

        case "DAILY":
          lateFee =
            Math.ceil(lateMinutes / 1440) *
            Number(organizationSettings.lateFeeValue);
          break;

        case "WEEKLY":
          lateFee =
            Math.ceil(lateMinutes / 10080) *
            Number(organizationSettings.lateFeeValue);
          break;

        case "MONTHLY":
          lateFee =
            Math.ceil(lateMinutes / 43200) *
            Number(organizationSettings.lateFeeValue);
          break;
      }
    }

    const returnRecord =
      await tx.return.upsert({
        where: {
          rentalId,
        },

        update: {
          returnedAt: now,
          status: "COMPLETED",
          condition: data.condition,

          damageNotes: data.damageNotes,

          missingAccessories:
            data.missingAccessories,

          lateByMinutes,
          lateFee,

          notes: data.notes,
        },

        create: {
          rentalId,

          returnedAt: now,

          status: "COMPLETED",

          condition: data.condition,

          damageNotes: data.damageNotes,

          missingAccessories:
            data.missingAccessories,

          lateByMinutes,
          lateFee,

          notes: data.notes,
        },
      });

    await tx.rental.update({
      where: {
        id: rentalId,
      },

      data: {
        actualReturnAt: now,
        status: "RETURNED",
        lateFee,
      },
    });

    return returnRecord;
  });
};