<?php

declare(strict_types=1);

abstract class BaseModel
{
    protected Database $db;

    public function __construct()
    {
        $this->db = db();
    }
}
