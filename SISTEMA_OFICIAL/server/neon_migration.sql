
DO $$
DECLARE
    r_shift RECORD;
    r_ride RECORD;
    v_driver_id TEXT;
    v_shift_id TEXT;
BEGIN
    RAISE NOTICE 'Starting Import...';

    -- Shift for Felipe at 2025-12-17T13:03:30.522Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Felipe'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-17T13:03:30.522Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-17T13:03:30.522Z', '2025-12-17T19:26:10.842Z', 
                42052, 42104, 'finalizado', 
                111.2, 10, 121.2, 
                0, 121.2, 72.72, 48.48,
                10, 382, 2.33
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-17T13:17:55.277Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 20.00, '2025-12-17T13:46:55.963Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.60, '2025-12-17T14:02:18.286Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.50, '2025-12-17T14:49:09.404Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.30, '2025-12-17T15:01:06.841Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.00, '2025-12-17T17:23:56.888Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.00, '2025-12-17T18:12:37.629Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.70, '2025-12-17T18:27:37.514Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 8.00, '2025-12-17T19:02:39.581Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.10, '2025-12-17T19:18:20.340Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Felipe', '2025-12-17T13:03:30.522Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Felipe';
    END IF;
    
    -- Shift for Gustavo at 2025-12-17T12:51:52.426Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Gustavo'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-17T12:51:52.426Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '40675965-5401-4f1b-adb3-6f0c64dccb5c', '2025-12-17T12:51:52.426Z', '2025-12-18T03:09:48.888Z', 
                19945, 20047, 'finalizado', 
                79.69, 165, 244.69, 
                0, 244.69, 146.81, 97.88,
                18, 857, 2.4
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-17T13:40:36.452Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-17T14:48:52.604Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-17T15:01:24.281Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-17T16:38:08.198Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 16.79, '2025-12-17T17:01:13.051Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-17T17:23:28.696Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-17T17:29:54.465Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-17T17:36:21.717Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 9.10, '2025-12-17T17:55:25.160Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 27.30, '2025-12-17T18:27:58.009Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-17T18:36:22.572Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 9.60, '2025-12-17T21:04:37.868Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 16.90, '2025-12-17T22:29:19.210Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-17T22:47:12.490Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-17T23:03:37.947Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-17T23:42:48.015Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-18T00:06:56.848Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 20.00, '2025-12-18T01:00:01.072Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Gustavo', '2025-12-17T12:51:52.426Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Gustavo';
    END IF;
    
    -- Shift for Felipe at 2025-12-17T22:32:47.095Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Felipe'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-17T22:32:47.095Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-17T22:32:47.095Z', '2025-12-18T04:23:53.881Z', 
                42217, 42320, 'finalizado', 
                195.25, 39, 234.25, 
                22.79, 211.46, 126.88, 84.58,
                16, 351, 2.05
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 13.50, '2025-12-17T22:47:18.379Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 10.60, '2025-12-17T22:58:43.483Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.00, '2025-12-17T23:12:55.627Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.00, '2025-12-18T00:07:52.861Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.00, '2025-12-18T00:25:47.459Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.50, '2025-12-18T00:45:43.840Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 16.70, '2025-12-18T01:07:05.044Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.60, '2025-12-18T01:25:14.528Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.00, '2025-12-18T01:37:16.500Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 24.50, '2025-12-18T02:01:33.260Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 10.45, '2025-12-18T02:12:28.624Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.80, '2025-12-18T02:26:36.928Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 14.00, '2025-12-18T02:47:35.994Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 18.00, '2025-12-18T02:58:55.375Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 17.60, '2025-12-18T03:23:42.991Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 25.00, '2025-12-18T03:53:18.267Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Felipe', '2025-12-17T22:32:47.095Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Felipe';
    END IF;
    
    -- Shift for Luan at 2025-12-17T12:44:12.854Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Luan'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-17T12:44:12.854Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '47f4e640-f4ef-4636-9838-3e27c89bf839', '2025-12-17T12:44:12.854Z', '2025-12-18T04:42:38.924Z', 
                29209, 29484, 'finalizado', 
                353.5, 66, 419.5, 
                21, 398.5, 239.1, 159.4,
                29, 958, 1.45
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 17.50, '2025-12-17T13:05:21.961Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.20, '2025-12-17T13:25:12.189Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 10.40, '2025-12-17T14:00:30.676Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 13.10, '2025-12-17T14:22:13.494Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.80, '2025-12-17T15:10:47.167Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.40, '2025-12-17T15:53:07.100Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.60, '2025-12-17T16:15:43.695Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-17T16:25:00.812Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.20, '2025-12-17T16:56:36.299Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.80, '2025-12-17T17:19:17.476Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-17T19:18:29.621Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.90, '2025-12-17T19:45:25.811Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.40, '2025-12-17T20:00:53.212Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 16.00, '2025-12-17T20:21:43.781Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.50, '2025-12-17T20:55:14.295Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 15.70, '2025-12-17T21:12:18.883Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 13.20, '2025-12-17T21:31:36.814Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 10.00, '2025-12-17T21:40:17.116Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.20, '2025-12-17T21:59:16.758Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 17.90, '2025-12-17T22:15:00.010Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 16.40, '2025-12-17T23:04:35.121Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 19.40, '2025-12-18T00:43:27.218Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 16.40, '2025-12-18T01:03:51.939Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 22.20, '2025-12-18T01:29:52.093Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 25.00, '2025-12-18T02:39:39.582Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.80, '2025-12-18T03:01:38.067Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.00, '2025-12-18T03:15:14.603Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.20, '2025-12-18T03:59:30.377Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 16.30, '2025-12-18T04:11:13.920Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Luan', '2025-12-17T12:44:12.854Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Luan';
    END IF;
    
END $$;
