IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Tasks] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [IsCompleted] bit NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_Tasks] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [Password] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260414193928_InitialCreate', N'8.0.0');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE INDEX [IX_Tasks_UserId] ON [Tasks] ([UserId]);
GO

ALTER TABLE [Tasks] ADD CONSTRAINT [FK_Tasks_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260415172725_AddUserRelation', N'8.0.0');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Tasks]') AND [c].[name] = N'IsCompleted');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Tasks] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [Tasks] DROP COLUMN [IsCompleted];
GO

ALTER TABLE [Tasks] ADD [Status] nvarchar(max) NOT NULL DEFAULT N'';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260416184213_AddTaskStatus', N'8.0.0');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Users] ADD [Role] nvarchar(max) NOT NULL DEFAULT N'';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260417070859_AddUserRole', N'8.0.0');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Users] ADD [CreatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Users] ADD [ModifiedAt] datetime2 NULL;
GO

ALTER TABLE [Tasks] ADD [CreatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Tasks] ADD [ModifiedAt] datetime2 NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260429083153_AddTimestamps', N'8.0.0');
GO

COMMIT;
GO

