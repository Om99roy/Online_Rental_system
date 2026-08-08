import type { Request, Response, NextFunction } from "express";

import {
  createDamageReportService,
  getDamageReportsByReturnService,
  getDamageReportService,
  updateDamageReportService,
  resolveDamageReportService,
  deleteDamageReportService,
} from "./damageReport.service.ts";

export const createDamageReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const damageReport =
      await createDamageReportService(req.body);

    res.status(201).json({
      success: true,
      message: "Damage report created successfully.",
      data: damageReport,
    });
  } catch (error) {
    next(error);
  }
};

export const getDamageReportsByReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reports =
      await getDamageReportsByReturnService(
        req.params.returnId as string,
      );

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

export const getDamageReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const report =
      await getDamageReportService(
        req.params.id as string,
      );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDamageReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const report =
      await updateDamageReportService(
        req.params.id as string,
        req.body,
      );

    res.status(200).json({
      success: true,
      message: "Damage report updated successfully.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveDamageReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const report =
      await resolveDamageReportService(
        req.params.id as string,
      );

    res.status(200).json({
      success: true,
      message: "Damage report resolved successfully.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDamageReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteDamageReportService(
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      message: "Damage report deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};