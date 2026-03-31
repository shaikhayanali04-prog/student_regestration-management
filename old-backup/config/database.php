<?php

declare(strict_types=1);

class Database
{
    private static ?self $instance = null;
    private PDO $pdo;

    private function __construct(array $config)
    {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $config['host'],
            $config['port'],
            $config['database'],
            $config['charset']
        );

        $this->pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self($GLOBALS['db_config'] ?? []);
        }

        return self::$instance;
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }

    public function statement(string $sql, array $params = []): PDOStatement
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $statement;
    }

    public function select(string $sql, array $params = []): array
    {
        return $this->statement($sql, $params)->fetchAll();
    }

    public function selectOne(string $sql, array $params = []): ?array
    {
        $row = $this->statement($sql, $params)->fetch();

        return $row === false ? null : $row;
    }

    public function scalar(string $sql, array $params = [])
    {
        $value = $this->statement($sql, $params)->fetchColumn();

        return $value === false ? null : $value;
    }

    public function execute(string $sql, array $params = []): bool
    {
        return $this->statement($sql, $params) instanceof PDOStatement;
    }

    public function insert(string $sql, array $params = []): int
    {
        $this->statement($sql, $params);

        return (int) $this->pdo->lastInsertId();
    }

    public function transaction(callable $callback)
    {
        try {
            $this->pdo->beginTransaction();
            $result = $callback($this);
            $this->pdo->commit();

            return $result;
        } catch (Throwable $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }

            throw $exception;
        }
    }
}
