import type { FieldError } from "react-hook-form";

interface FormErrorProps {
  error?: FieldError;
}

const FormError = ({ error }: FormErrorProps) => {
  if (!error?.message) return null;

  return <p className="text-xs text-red-400 mt-1.5">{error.message}</p>;
};

export default FormError;
