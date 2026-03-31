<?php

declare(strict_types=1);

class View
{
    public static function render(string $view, array $data = [], string $layout = 'app'): void
    {
        $viewFile = app_config('base_path') . '/views/' . $view . '.php';
        $layoutFile = app_config('base_path') . '/views/layouts/' . $layout . '.php';

        if (!file_exists($viewFile)) {
            Response::abort(500, 'View not found: ' . $view);
        }

        if (!file_exists($layoutFile)) {
            Response::abort(500, 'Layout not found: ' . $layout);
        }

        extract($data, EXTR_SKIP);

        ob_start();
        require $viewFile;
        $content = ob_get_clean();

        require $layoutFile;
    }

    public static function partial(string $partial, array $data = []): void
    {
        $partialFile = app_config('base_path') . '/views/' . $partial . '.php';

        if (!file_exists($partialFile)) {
            Response::abort(500, 'Partial not found: ' . $partial);
        }

        extract($data, EXTR_SKIP);
        require $partialFile;
    }
}
