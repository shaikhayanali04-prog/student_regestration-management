<?php

declare(strict_types=1);

class Validator
{
    public static function validate(array $input, array $rules): array
    {
        $errors = [];
        $clean = $input;

        foreach ($rules as $field => $fieldRules) {
            $value = $input[$field] ?? null;
            $fieldRules = is_array($fieldRules) ? $fieldRules : explode('|', (string) $fieldRules);

            if (is_string($value)) {
                $value = trim($value);
            }

            foreach ($fieldRules as $rule) {
                $name = $rule;
                $parameter = null;

                if (str_contains($rule, ':')) {
                    [$name, $parameter] = explode(':', $rule, 2);
                }

                if ($name === 'required' && ($value === null || $value === '')) {
                    $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required.';
                    break;
                }

                if (($value === null || $value === '') && $name !== 'required') {
                    continue;
                }

                if ($name === 'email' && filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
                    $errors[$field] = 'Please enter a valid email address.';
                    break;
                }

                if ($name === 'numeric' && !is_numeric($value)) {
                    $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' must be numeric.';
                    break;
                }

                if ($name === 'integer' && filter_var($value, FILTER_VALIDATE_INT) === false) {
                    $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' must be an integer.';
                    break;
                }

                if ($name === 'date' && strtotime((string) $value) === false) {
                    $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' must be a valid date.';
                    break;
                }

                if ($name === 'max' && mb_strlen((string) $value) > (int) $parameter) {
                    $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is too long.';
                    break;
                }

                if ($name === 'min' && is_numeric($value) && (float) $value < (float) $parameter) {
                    $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' must be at least ' . $parameter . '.';
                    break;
                }

                if ($name === 'in') {
                    $allowed = array_map('trim', explode(',', (string) $parameter));

                    if (!in_array((string) $value, $allowed, true)) {
                        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' contains an invalid option.';
                        break;
                    }
                }
            }

            $clean[$field] = $value;
        }

        return [$clean, $errors];
    }
}
