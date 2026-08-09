interface RoleToggleProps {
    role: "CUSTOMER" | "ADMIN";
    onChange: (role: "CUSTOMER" | "ADMIN") => void;
}

export default function RoleToggle({ role, onChange }: RoleToggleProps) {
    return (
        <div className="flex items-center justify-center mb-2">
            <div className="bg-surface-2 border border-border rounded-full p-1 flex gap-1">
                <button
                    type="button"
                    onClick={() => onChange("CUSTOMER")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${role === "CUSTOMER" ? "bg-primary text-white shadow-lg" : "text-text-muted hover:text-text"
                        }`}
                >
                    Customer
                </button>
                <button
                    type="button"
                    onClick={() => onChange("ADMIN")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${role === "ADMIN" ? "bg-purple-600 text-white shadow-lg" : "text-text-muted hover:text-text"
                        }`}
                >
                    Admin
                </button>
            </div>
        </div>
    );
}