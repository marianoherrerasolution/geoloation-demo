export interface AlertProps {
  message?: string;
  className?: string;
  theme?: string;
}

const AlertBadge = ({  message, className, theme }: AlertProps) => {
  const basicClassName = "flex rounded-lg p-4 mb-4 text-sm"
  const classTheme = () => {
    switch (theme) {
      case "warning":
        return `${basicClassName} bg-orange-100 text-orange-700 ${className}`;
      case "error":
        return `${basicClassName} bg-red-100 text-red-700 ${className}`;
      case "success":
        return `${basicClassName} bg-green-100 text-green-700 ${className}`;
      case "info":
        return `${basicClassName} bg-blue-100 text-blue-700 ${className}`;
      default:
        return basicClassName;
    }
  }

  return (
    <div className={classTheme()} role="alert">
      { message }
    </div>
  );
};

export default AlertBadge;
