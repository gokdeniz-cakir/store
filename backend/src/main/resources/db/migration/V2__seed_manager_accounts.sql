INSERT INTO users (name, email, password_hash, role)
VALUES
    (
        'Aurelia Sales Manager',
        'sales.manager@aurelia.com',
        '$2a$10$RJh.rKHD6bSdRlwuzEe.mOtkhNco/bqgAho/Iw0IvjQsvT7JzORGS',
        'SALES_MANAGER'
    ),
    (
        'Aurelia Product Manager',
        'product.manager@aurelia.com',
        '$2a$10$6acJOvXLI5uedfIAwrlNxe5ICSmLZCIe.TB0D.oVxpdelMQsG9aXq',
        'PRODUCT_MANAGER'
    )
ON CONFLICT (email) DO NOTHING;
