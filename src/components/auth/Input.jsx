import { useState } from 'react';
import './Input.css';

const EyeIcon = () => (
  <svg
    className="toggle-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1 12C3 8 7 5 12 5C17 5 21 8 23 12C21 16 17 19 12 19C7 19 3 16 1 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="1"
      fill="currentColor"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    className="toggle-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1 12C3 8 7 5 12 5C17 5 21 8 23 12C21 16 17 19 12 19C7 19 3 16 1 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 2L22 22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  icon,
  showToggle = false,
  error,
  disabled = false,
  autoFocus = false,
  name,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType =
    type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}

      <div
        className={`input-wrapper ${
          isFocused ? 'focused' : ''
        } ${error ? 'error' : ''}`}
      >
        {icon && (
          <div className="input-icon">
            {icon}
          </div>
        )}

        <input
          type={inputType}
          className="input-field"
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoFocus={autoFocus}
          {...rest}
        />

        {showToggle && type === 'password' && (
          <button
            type="button"
            className="input-toggle"
            onClick={() =>
              setShowPassword((prev) => !prev)
            }
            aria-label={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
          >
            {showPassword ? (
              <EyeIcon />
            ) : (
              <EyeOffIcon />
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="input-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;