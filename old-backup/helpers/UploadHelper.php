<?php

declare(strict_types=1);

class UploadHelper
{
    public static function storeStudentPhoto(array $file, ?string $existing = null): ?string
    {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return $existing;
        }

        if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            throw new RuntimeException('Photo upload failed. Please try a smaller file.');
        }

        if (($file['size'] ?? 0) > (int) app_config('max_upload_size')) {
            throw new RuntimeException('Photo exceeds the allowed size limit.');
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        $allowed = app_config('allowed_image_mime', []);

        if (!in_array($mime, $allowed, true)) {
            throw new RuntimeException('Only JPG, PNG, and WEBP images are allowed.');
        }

        $extensionMap = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        $uploadDirectory = app_config('upload_dir');

        if (!is_dir($uploadDirectory)) {
            mkdir($uploadDirectory, 0775, true);
        }

        $filename = bin2hex(random_bytes(18)) . '.' . ($extensionMap[$mime] ?? 'jpg');
        $destination = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            throw new RuntimeException('Unable to move uploaded file.');
        }

        if ($existing) {
            $oldPath = $uploadDirectory . DIRECTORY_SEPARATOR . $existing;

            if (is_file($oldPath)) {
                @unlink($oldPath);
            }
        }

        return $filename;
    }
}
