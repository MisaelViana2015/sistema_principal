
DO $$
DECLARE
    r_shift RECORD;
    r_ride RECORD;
    v_driver_id TEXT;
    v_shift_id TEXT;
BEGIN
    RAISE NOTICE 'Starting Import...';

    -- Shift for Gustavo at 2025-12-16T12:38:00.175Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Gustavo'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-16T12:38:00.175Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '40675965-5401-4f1b-adb3-6f0c64dccb5c', '2025-12-16T12:38:00.175Z', '2025-12-17T03:39:16.134Z', 
                19779, 19931, 'finalizado', 
                111.27, 313, 424.27, 
                0, 424.27, 212.135, 212.135,
                26, 901, 2.79
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T14:10:43.928Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-16T14:34:40.524Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T14:50:13.251Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T15:09:58.625Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-16T17:36:11.156Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 80.00, '2025-12-16T17:40:21.742Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T17:57:37.434Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.77, '2025-12-16T19:50:03.422Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T20:04:12.571Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T20:18:12.606Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.10, '2025-12-16T20:41:24.141Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-16T20:46:30.408Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 13.00, '2025-12-16T22:04:37.706Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 25.00, '2025-12-16T22:18:15.059Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T22:36:08.617Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T23:17:41.985Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T23:44:15.651Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-16T23:56:56.193Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 9.40, '2025-12-17T00:11:35.845Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.10, '2025-12-17T00:18:45.322Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 10.80, '2025-12-17T00:44:37.391Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 10.70, '2025-12-17T00:55:15.769Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 20.00, '2025-12-17T01:27:08.103Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 13.30, '2025-12-17T02:17:37.018Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 18.40, '2025-12-17T02:43:40.718Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.70, '2025-12-17T03:27:18.637Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Gustavo', '2025-12-16T12:38:00.175Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Gustavo';
    END IF;
    
    -- Shift for Luan at 2025-12-16T12:44:19.408Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Luan'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-16T12:44:19.408Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '47f4e640-f4ef-4636-9838-3e27c89bf839', '2025-12-16T12:44:19.408Z', '2025-12-17T02:21:05.321Z', 
                28979, 29208, 'finalizado', 
                354.44, 71, 425.44, 
                0, 425.44, 212.72, 212.72,
                27, 816, 1.86
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.70, '2025-12-16T12:56:44.004Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 21.90, '2025-12-16T13:22:56.907Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 10.30, '2025-12-16T14:27:55.874Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.00, '2025-12-16T14:44:12.367Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.10, '2025-12-16T14:57:14.991Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T15:17:53.814Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 33.10, '2025-12-16T15:44:48.880Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 13.90, '2025-12-16T16:03:51.954Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.20, '2025-12-16T16:15:27.129Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 10.80, '2025-12-16T17:23:03.123Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.60, '2025-12-16T18:05:08.581Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 12.00, '2025-12-16T18:31:21.539Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.70, '2025-12-16T18:40:56.485Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 17.00, '2025-12-16T19:00:11.317Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.77, '2025-12-16T19:35:27.822Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.40, '2025-12-16T19:45:22.595Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T20:27:52.976Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 19.00, '2025-12-16T21:32:35.830Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 16.10, '2025-12-16T21:44:28.252Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.30, '2025-12-16T22:04:13.009Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 12.00, '2025-12-16T22:32:58.865Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 19.77, '2025-12-17T00:05:05.454Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 35.00, '2025-12-17T00:32:45.154Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 15.40, '2025-12-17T00:52:32.546Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 13.60, '2025-12-17T01:08:40.076Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.70, '2025-12-17T01:30:50.365Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 13.10, '2025-12-17T02:20:22.951Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Luan', '2025-12-16T12:44:19.408Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Luan';
    END IF;
    
    -- Shift for Robson at 2025-12-16T15:14:26.429Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Robson'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-16T15:14:26.429Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-16T15:14:26.429Z', '2025-12-16T20:31:56.934Z', 
                41889, 41954, 'finalizado', 
                114.3, 15, 129.3, 
                0, 129.3, 64.65, 64.65,
                8, 317, 1.99
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.40, '2025-12-16T15:44:52.704Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 18.00, '2025-12-16T16:06:32.668Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.90, '2025-12-16T17:09:00.907Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 24.20, '2025-12-16T17:36:44.727Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 15.80, '2025-12-16T18:40:22.091Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 14.00, '2025-12-16T18:51:09.017Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 15.00, '2025-12-16T19:07:01.711Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 15.00, '2025-12-16T19:22:54.449Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Robson', '2025-12-16T15:14:26.429Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Robson';
    END IF;
    
    -- Shift for Felipe at 2025-12-16T21:31:20.290Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Felipe'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-16T21:31:20.290Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-16T21:31:20.290Z', '2025-12-17T03:59:01.025Z', 
                41955, 42052, 'finalizado', 
                146.42, 65, 211.42, 
                0, 211.42, 105.71, 105.71,
                17, 387, 2.18
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 9.90, '2025-12-16T21:50:52.453Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 8.00, '2025-12-16T22:12:48.988Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-16T22:26:48.045Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.70, '2025-12-16T22:29:18.957Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.00, '2025-12-16T22:40:59.000Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 8.00, '2025-12-16T22:52:40.068Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.00, '2025-12-16T23:12:45.433Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 10.00, '2025-12-16T23:25:01.831Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 10.00, '2025-12-17T00:09:01.500Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 11.90, '2025-12-17T00:47:52.462Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.50, '2025-12-17T01:43:11.185Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 25.00, '2025-12-17T01:58:40.526Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 18.80, '2025-12-17T02:17:41.725Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'particular', 20.00, '2025-12-17T02:49:54.741Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 12.84, '2025-12-17T03:16:04.608Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 8.00, '2025-12-17T03:27:06.737Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'app', 10.78, '2025-12-17T03:45:05.817Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Felipe', '2025-12-16T21:31:20.290Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Felipe';
    END IF;
    
    -- Shift for Gustavo at 2025-12-18T12:06:51.873Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Gustavo'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-18T12:06:51.873Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '40675965-5401-4f1b-adb3-6f0c64dccb5c', '2025-12-18T12:06:51.873Z', '2025-12-19T05:15:45.571Z', 
                20142, 20317, 'finalizado', 
                154.31, 304, 458.31, 
                0, 458.31, 274.986, 183.324,
                30, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-18T13:40:44.196Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-18T14:19:07.304Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-18T14:57:36.241Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-18T15:08:58.077Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.02, '2025-12-18T15:31:48.762Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 30.00, '2025-12-18T16:26:49.532Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-18T17:08:28.785Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-18T17:25:59.039Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-18T17:37:05.136Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-18T18:13:07.764Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-18T19:08:13.643Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.20, '2025-12-18T19:30:54.346Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.00, '2025-12-18T19:42:09.297Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.40, '2025-12-18T20:20:48.170Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-18T20:36:55.162Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-18T21:10:41.247Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-18T21:51:45.821Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-18T22:08:00.687Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-18T22:19:21.453Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-18T23:35:22.097Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-19T00:19:52.080Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-19T00:38:29.198Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-19T01:08:11.407Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-19T01:40:30.544Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-19T01:51:23.371Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 19.70, '2025-12-19T03:21:00.636Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.20, '2025-12-19T03:29:11.440Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.50, '2025-12-19T04:10:54.862Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 33.10, '2025-12-19T04:41:04.313Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 22.19, '2025-12-19T05:01:02.346Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Gustavo', '2025-12-18T12:06:51.873Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Gustavo';
    END IF;
    
    -- Shift for Robson at 2025-12-18T13:48:16.172Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Robson'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-18T13:48:16.172Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-18T13:48:16.172Z', '2025-12-19T00:37:44.640Z', 
                42323, 42496, 'finalizado', 
                208.73, 120, 328.73, 
                0, 328.73, 197.238, 131.492,
                21, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.00, '2025-12-18T14:16:58.039Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.13, '2025-12-18T14:59:25.363Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.60, '2025-12-18T15:11:29.553Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.50, '2025-12-18T15:26:46.696Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 25.00, '2025-12-18T15:47:59.657Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-18T16:17:29.107Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-18T17:46:06.131Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.00, '2025-12-18T18:05:32.598Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.00, '2025-12-18T18:36:03.410Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.80, '2025-12-18T18:51:52.089Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 16.00, '2025-12-18T19:10:54.145Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 12.00, '2025-12-18T19:26:33.259Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 18.00, '2025-12-18T19:45:05.775Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 12.00, '2025-12-18T19:57:01.803Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 8.00, '2025-12-18T22:21:03.422Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.10, '2025-12-18T22:33:07.446Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-18T22:54:29.497Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 40.00, '2025-12-18T23:31:47.270Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 17.00, '2025-12-18T23:58:51.494Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.60, '2025-12-19T00:14:04.239Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.00, '2025-12-19T00:33:18.922Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Robson', '2025-12-18T13:48:16.172Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Robson';
    END IF;
    
    -- Shift for Felipe at 2025-12-19T01:19:06.813Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Felipe'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-19T01:19:06.813Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '47f4e640-f4ef-4636-9838-3e27c89bf839', '2025-12-19T01:19:06.813Z', '2025-12-19T06:56:40.696Z', 
                29827, 29913, 'finalizado', 
                149.26, 47, 196.26, 
                0, 196.26, 117.756, 78.504,
                12, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.60, '2025-12-19T01:37:29.911Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.00, '2025-12-19T02:05:51.541Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.00, '2025-12-19T02:41:35.316Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.20, '2025-12-19T02:57:14.997Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 35.00, '2025-12-19T03:25:23.880Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 8.70, '2025-12-19T04:07:58.818Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 12.00, '2025-12-19T04:31:56.651Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.60, '2025-12-19T04:54:23.843Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.90, '2025-12-19T05:09:18.093Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.26, '2025-12-19T05:22:54.539Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 25.00, '2025-12-19T06:11:05.497Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.00, '2025-12-19T06:35:57.895Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Felipe', '2025-12-19T01:19:06.813Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Felipe';
    END IF;
    
    -- Shift for Robson at 2025-12-19T01:36:35.652Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Robson'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-19T01:36:35.652Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-19T01:36:35.652Z', '2025-12-19T04:36:08.936Z', 
                42505, 42559, 'finalizado', 
                93.7, 0, 93.7, 
                35.1, 58.6, 35.16, 23.44,
                7, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.60, '2025-12-19T01:46:39.010Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.40, '2025-12-19T02:09:29.096Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.70, '2025-12-19T02:21:12.861Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.00, '2025-12-19T02:41:06.352Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.30, '2025-12-19T03:27:53.605Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.70, '2025-12-19T03:59:49.215Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.00, '2025-12-19T04:11:37.342Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Robson', '2025-12-19T01:36:35.652Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Robson';
    END IF;
    
    -- Shift for Gustavo at 2025-12-19T12:33:37.183Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Gustavo'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-19T12:33:37.183Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '40675965-5401-4f1b-adb3-6f0c64dccb5c', '2025-12-19T12:33:37.183Z', '2025-12-20T05:50:48.437Z', 
                20330, 20598, 'finalizado', 
                188.28, 320, 508.28, 
                0, 508.28, 304.968, 203.312,
                31, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-19T13:34:54.958Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.80, '2025-12-19T14:26:54.941Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.30, '2025-12-19T14:43:49.841Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-19T14:56:11.918Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-19T15:04:47.012Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-19T15:58:47.930Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-19T16:14:39.662Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-19T16:21:51.934Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-19T16:50:38.675Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-19T17:05:15.219Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-19T17:34:56.460Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-19T17:50:56.248Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-19T19:48:07.088Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-19T22:53:59.618Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.80, '2025-12-19T23:13:50.697Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.57, '2025-12-19T23:34:53.646Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-20T00:05:18.972Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-20T00:48:00.750Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-20T00:17:00.000Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-20T01:11:36.693Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-20T01:29:34.612Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-20T02:06:21.356Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-20T02:25:03.580Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 22.00, '2025-12-20T03:02:13.037Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.50, '2025-12-20T03:12:38.215Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.80, '2025-12-20T03:26:25.789Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 22.10, '2025-12-20T03:43:03.315Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.40, '2025-12-20T04:47:16.801Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-20T05:20:34.784Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 21.90, '2025-12-20T05:37:36.005Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.11, '2025-12-20T05:48:11.102Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Gustavo', '2025-12-19T12:33:37.183Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Gustavo';
    END IF;
    
    -- Shift for Luan at 2025-12-19T12:49:43.671Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Luan'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-19T12:49:43.671Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '47f4e640-f4ef-4636-9838-3e27c89bf839', '2025-12-19T12:49:43.671Z', '2025-12-20T07:16:12.990Z', 
                29915, 30235, 'finalizado', 
                420.34, 237, 657.34, 
                40, 617.34, 370.404, 246.936,
                38, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-19T13:11:09.931Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.16, '2025-12-19T13:29:08.096Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 36.60, '2025-12-19T13:52:20.999Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.70, '2025-12-19T14:12:51.976Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.00, '2025-12-19T14:24:48.221Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.10, '2025-12-19T14:37:19.206Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.80, '2025-12-19T14:47:07.457Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.70, '2025-12-19T14:57:22.894Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.50, '2025-12-19T15:07:11.281Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.40, '2025-12-19T15:36:29.425Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 26.30, '2025-12-19T16:07:51.649Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.20, '2025-12-19T16:20:21.817Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-19T17:07:04.843Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-19T17:40:32.623Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.13, '2025-12-19T18:20:09.550Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.40, '2025-12-19T18:33:55.754Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.40, '2025-12-19T19:56:52.336Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.70, '2025-12-19T20:16:03.693Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.21, '2025-12-19T20:40:25.744Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.60, '2025-12-19T20:55:58.979Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 12.00, '2025-12-19T21:07:27.819Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-19T21:32:20.393Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-19T23:31:24.386Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-19T23:57:00.052Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 12.00, '2025-12-20T00:17:52.380Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 18.00, '2025-12-20T00:34:07.818Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 19.00, '2025-12-20T00:53:56.434Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.60, '2025-12-20T01:16:34.175Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 50.00, '2025-12-20T03:09:17.515Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-20T03:34:49.902Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-20T04:19:56.081Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 23.50, '2025-12-20T04:41:11.711Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.50, '2025-12-20T05:34:28.912Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.30, '2025-12-20T05:48:33.604Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 28.00, '2025-12-20T06:10:23.200Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.20, '2025-12-20T06:31:05.249Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.94, '2025-12-20T06:43:57.871Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.40, '2025-12-20T07:15:26.167Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Luan', '2025-12-19T12:49:43.671Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Luan';
    END IF;
    
    -- Shift for Robson at 2025-12-19T14:26:19.967Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Robson'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-19T14:26:19.967Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-19T14:26:19.967Z', '2025-12-20T07:30:17.197Z', 
                42559, 42740, 'finalizado', 
                454.1, 74, 528.1, 
                0, 528.1, 316.86, 211.24,
                26, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.00, '2025-12-19T14:48:42.688Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.00, '2025-12-19T14:58:12.372Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.80, '2025-12-19T15:16:40.514Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.60, '2025-12-19T15:23:34.268Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.60, '2025-12-19T15:27:28.584Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-19T15:35:55.364Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 14.00, '2025-12-19T16:34:20.663Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.00, '2025-12-19T16:53:12.331Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.00, '2025-12-19T17:15:16.466Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-19T18:54:40.862Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.50, '2025-12-19T19:08:01.976Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.50, '2025-12-19T19:22:41.107Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.20, '2025-12-19T22:04:21.869Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-19T23:03:00.759Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 19.00, '2025-12-19T23:30:11.838Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.20, '2025-12-20T01:00:44.839Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.50, '2025-12-20T02:43:30.246Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.30, '2025-12-20T02:44:06.364Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.00, '2025-12-20T02:57:20.936Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.00, '2025-12-20T03:32:52.058Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.00, '2025-12-20T04:11:25.798Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-20T04:31:14.812Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.50, '2025-12-20T05:29:27.723Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 27.00, '2025-12-20T05:47:19.403Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.40, '2025-12-20T06:00:36.754Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 160.00, '2025-12-20T07:21:28.921Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Robson', '2025-12-19T14:26:19.967Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Robson';
    END IF;
    
    -- Shift for Gustavo at 2025-12-20T13:33:55.131Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Gustavo'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-20T13:33:55.131Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '40675965-5401-4f1b-adb3-6f0c64dccb5c', '2025-12-20T13:33:55.131Z', '2025-12-21T01:24:35.164Z', 
                20677, 20855, 'finalizado', 
                142.2, 288, 430.2, 
                0, 430.2, 258.12, 172.08,
                24, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-20T14:21:06.402Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.20, '2025-12-20T14:32:08.193Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-20T14:46:01.242Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-20T14:59:49.520Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-20T15:13:12.902Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 12.00, '2025-12-20T16:33:10.367Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.00, '2025-12-20T16:51:09.367Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.80, '2025-12-20T17:13:03.714Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 21.30, '2025-12-20T17:20:39.191Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.80, '2025-12-20T17:28:43.405Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 21.20, '2025-12-20T17:46:23.663Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.10, '2025-12-20T17:56:27.441Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-20T18:25:34.735Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 40.00, '2025-12-20T19:50:36.545Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-20T20:32:46.843Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.60, '2025-12-20T21:44:22.220Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.20, '2025-12-20T22:06:03.485Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 40.00, '2025-12-20T22:45:51.702Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-20T23:01:28.637Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-20T23:12:53.492Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-20T23:43:02.398Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-21T00:34:59.407Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-21T00:57:07.280Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 17.00, '2025-12-21T01:18:42.042Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Gustavo', '2025-12-20T13:33:55.131Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Gustavo';
    END IF;
    
    -- Shift for Luan at 2025-12-20T14:13:18.808Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Luan'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-20T14:13:18.808Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '47f4e640-f4ef-4636-9838-3e27c89bf839', '2025-12-20T14:13:18.808Z', '2025-12-21T03:20:47.477Z', 
                30242, 30485, 'finalizado', 
                557.6, 30, 587.6, 
                0, 587.6, 352.56, 235.04,
                30, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 24.40, '2025-12-20T14:36:25.052Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.50, '2025-12-20T14:53:48.252Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.40, '2025-12-20T15:07:29.961Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.80, '2025-12-20T15:27:35.654Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.10, '2025-12-20T15:34:43.409Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.70, '2025-12-20T15:51:14.684Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.00, '2025-12-20T16:08:30.420Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.00, '2025-12-20T16:39:19.962Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.50, '2025-12-20T16:55:51.355Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.90, '2025-12-20T17:04:41.031Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.40, '2025-12-20T17:17:52.128Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.80, '2025-12-20T17:28:45.415Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.50, '2025-12-20T17:47:40.869Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 57.60, '2025-12-20T18:38:16.136Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.20, '2025-12-20T20:18:08.142Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.20, '2025-12-20T20:30:13.762Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.90, '2025-12-20T21:49:07.887Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 32.60, '2025-12-20T22:18:01.775Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.70, '2025-12-20T22:43:39.037Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-20T22:56:41.162Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 24.90, '2025-12-20T23:20:02.151Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.70, '2025-12-20T23:36:14.095Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.40, '2025-12-20T23:52:03.543Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.20, '2025-12-21T00:11:53.741Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-21T00:55:27.353Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 52.80, '2025-12-21T02:13:58.563Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.30, '2025-12-21T02:36:22.698Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 23.70, '2025-12-21T02:58:36.716Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.00, '2025-12-21T03:06:45.999Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.40, '2025-12-21T03:19:07.946Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Luan', '2025-12-20T14:13:18.808Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Luan';
    END IF;
    
    -- Shift for Robson at 2025-12-20T15:04:59.173Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Robson'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-20T15:04:59.173Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-20T15:04:59.173Z', '2025-12-21T06:39:26.181Z', 
                42740, 42985, 'finalizado', 
                535.32, 170, 705.32, 
                0, 705.32, 423.192, 282.128,
                35, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.50, '2025-12-20T15:25:08.432Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.10, '2025-12-20T15:39:11.531Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.00, '2025-12-20T15:47:02.672Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.00, '2025-12-20T16:08:27.937Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-20T16:39:59.648Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.00, '2025-12-20T16:50:52.266Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 60.00, '2025-12-20T17:28:30.211Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.00, '2025-12-20T18:22:31.959Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.00, '2025-12-20T18:36:13.365Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.00, '2025-12-20T18:48:59.725Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.00, '2025-12-20T19:03:04.117Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.00, '2025-12-20T19:19:57.374Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.00, '2025-12-20T19:19:57.374Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 17.00, '2025-12-20T20:50:54.667Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 50.00, '2025-12-20T22:35:39.283Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 22.00, '2025-12-20T23:51:08.479Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.90, '2025-12-21T00:05:02.950Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.00, '2025-12-21T00:41:10.046Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.00, '2025-12-21T00:41:30.330Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.20, '2025-12-21T01:13:49.333Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.20, '2025-12-21T01:31:54.252Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.00, '2025-12-21T02:08:15.239Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 24.00, '2025-12-21T02:26:14.432Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.60, '2025-12-21T02:44:29.533Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.40, '2025-12-21T03:03:49.337Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 21.00, '2025-12-21T03:15:07.303Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.00, '2025-12-21T03:46:57.081Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 18.00, '2025-12-21T04:07:24.846Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 25.00, '2025-12-21T04:50:35.909Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.00, '2025-12-21T05:03:30.080Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.70, '2025-12-21T05:18:05.889Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.80, '2025-12-21T05:39:26.832Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.30, '2025-12-21T05:49:37.728Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 22.22, '2025-12-21T06:07:32.016Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 30.40, '2025-12-21T06:35:52.768Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Robson', '2025-12-20T15:04:59.173Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Robson';
    END IF;
    
    -- Shift for Felipe at 2025-12-21T01:37:48.351Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Felipe'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-21T01:37:48.351Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '40675965-5401-4f1b-adb3-6f0c64dccb5c', '2025-12-21T01:37:48.351Z', '2025-12-21T08:10:58.036Z', 
                20858, 20986, 'finalizado', 
                240.8, 91, 331.8, 
                30.52, 301.28, 180.768, 120.512,
                20, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.20, '2025-12-21T02:46:15.724Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.90, '2025-12-21T03:05:38.716Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-21T03:41:36.346Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.50, '2025-12-21T03:47:15.835Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.00, '2025-12-21T04:05:08.156Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.40, '2025-12-21T04:15:13.850Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.00, '2025-12-21T04:35:20.666Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.00, '2025-12-21T04:58:53.311Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.90, '2025-12-21T05:10:46.276Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.00, '2025-12-21T05:22:32.826Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.20, '2025-12-21T05:45:19.302Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 16.00, '2025-12-21T06:01:45.291Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.20, '2025-12-21T06:14:56.651Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.00, '2025-12-21T06:27:38.964Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.00, '2025-12-21T06:44:31.076Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 23.40, '2025-12-21T07:06:44.986Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.10, '2025-12-21T07:21:22.498Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 30.00, '2025-12-21T07:37:37.168Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-21T07:49:28.522Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-21T08:05:37.978Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Felipe', '2025-12-21T01:37:48.351Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Felipe';
    END IF;
    
    -- Shift for Felipe at 2025-12-21T14:15:36.645Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Felipe'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-21T14:15:36.645Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '40675965-5401-4f1b-adb3-6f0c64dccb5c', '2025-12-21T14:15:36.645Z', '2025-12-21T18:26:45.332Z', 
                21018, 21101, 'finalizado', 
                92.7, 123, 215.7, 
                0, 215.7, 129.42, 86.28,
                12, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.50, '2025-12-21T14:45:30.837Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.10, '2025-12-21T15:03:09.045Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.00, '2025-12-21T15:10:43.701Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.20, '2025-12-21T15:25:25.844Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.50, '2025-12-21T15:36:08.815Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.40, '2025-12-21T15:53:20.397Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-21T16:13:11.316Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-21T16:28:08.004Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 40.00, '2025-12-21T16:56:47.702Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.00, '2025-12-21T17:12:00.135Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 40.00, '2025-12-21T18:07:39.213Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-21T18:17:51.568Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Felipe', '2025-12-21T14:15:36.645Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Felipe';
    END IF;
    
    -- Shift for Felipe at 2025-12-21T18:37:47.720Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Felipe'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-21T18:37:47.720Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-21T18:37:47.720Z', '2025-12-21T19:50:28.092Z', 
                42987, 43014, 'finalizado', 
                38.7, 0, 38.7, 
                0, 38.7, 23.22, 15.48,
                3, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.00, '2025-12-21T19:02:19.803Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.40, '2025-12-21T19:28:56.364Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.30, '2025-12-21T19:44:29.518Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Felipe', '2025-12-21T18:37:47.720Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Felipe';
    END IF;
    
    -- Shift for Luan at 2025-12-21T19:34:57.515Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Luan'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-21T19:34:57.515Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '47f4e640-f4ef-4636-9838-3e27c89bf839', '2025-12-21T19:34:57.515Z', '2025-12-22T05:58:38.288Z', 
                30492, 30677, 'finalizado', 
                326.48, 80, 406.48, 
                0, 406.48, 243.888, 162.592,
                20, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 35.00, '2025-12-21T20:07:45.399Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 21.50, '2025-12-21T20:24:31.074Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 26.90, '2025-12-21T20:48:58.492Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 23.10, '2025-12-21T21:07:49.887Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 28.30, '2025-12-21T21:32:34.971Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.70, '2025-12-21T22:00:49.828Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.50, '2025-12-21T22:03:18.928Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.70, '2025-12-21T22:59:10.579Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 35.00, '2025-12-21T23:47:35.423Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.50, '2025-12-22T00:08:15.587Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-22T00:38:02.197Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.60, '2025-12-22T01:05:36.003Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.90, '2025-12-22T03:07:44.589Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.38, '2025-12-22T03:29:07.426Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-22T03:44:32.464Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.00, '2025-12-22T04:04:07.692Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 25.50, '2025-12-22T04:33:28.551Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 23.40, '2025-12-22T04:49:03.211Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.50, '2025-12-22T05:22:42.536Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-22T05:38:30.347Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Luan', '2025-12-21T19:34:57.515Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Luan';
    END IF;
    
    -- Shift for Robson at 2025-12-21T19:55:09.555Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Robson'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-21T19:55:09.555Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-21T19:55:09.555Z', '2025-12-22T05:34:56.199Z', 
                43014, 43172, 'finalizado', 
                274.2, 100, 374.2, 
                25, 349.2, 209.52, 139.68,
                15, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.10, '2025-12-21T20:22:17.044Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.70, '2025-12-21T20:38:41.201Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 40.00, '2025-12-21T21:11:04.047Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-21T21:37:03.667Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 19.50, '2025-12-21T21:58:36.461Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 100.00, '2025-12-21T22:37:59.876Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-21T23:16:17.070Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.20, '2025-12-21T23:36:05.829Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 22.00, '2025-12-22T00:03:00.723Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-22T01:29:28.534Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.40, '2025-12-22T01:44:33.848Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 24.70, '2025-12-22T01:54:34.861Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-22T02:18:07.023Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 19.40, '2025-12-22T04:57:58.328Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 23.20, '2025-12-22T05:15:41.049Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Robson', '2025-12-21T19:55:09.555Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Robson';
    END IF;
    
    -- Shift for Gustavo at 2025-12-21T20:01:15.808Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Gustavo'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-21T20:01:15.808Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '40675965-5401-4f1b-adb3-6f0c64dccb5c', '2025-12-21T20:01:15.808Z', '2025-12-22T06:01:17.128Z', 
                21141, 21309, 'finalizado', 
                208, 203, 411, 
                30.04, 380.96, 228.576, 152.384,
                17, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.50, '2025-12-21T20:48:58.456Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.60, '2025-12-21T21:03:58.365Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.50, '2025-12-21T21:35:12.389Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.70, '2025-12-21T21:47:33.024Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.30, '2025-12-21T22:00:48.718Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 19.70, '2025-12-21T22:15:38.229Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 24.70, '2025-12-21T22:35:21.854Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 28.40, '2025-12-21T22:56:46.939Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-21T23:14:57.305Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.80, '2025-12-21T23:55:49.747Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.00, '2025-12-22T00:02:52.880Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-22T00:13:36.792Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 60.00, '2025-12-22T00:54:47.266Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 80.00, '2025-12-22T03:24:42.441Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-22T03:52:00.175Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 22.80, '2025-12-22T04:24:46.099Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-22T05:50:39.768Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Gustavo', '2025-12-21T20:01:15.808Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Gustavo';
    END IF;
    
    -- Shift for Gustavo at 2025-12-22T12:34:18.218Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Gustavo'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-22T12:34:18.218Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '40675965-5401-4f1b-adb3-6f0c64dccb5c', '2025-12-22T12:34:18.218Z', '2025-12-23T03:33:29.015Z', 
                21326, 21487, 'finalizado', 
                91.4, 314, 405.4, 
                0, 405.4, 243.24, 162.16,
                24, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-22T13:47:34.250Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 40.00, '2025-12-22T14:10:12.552Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-22T14:35:40.947Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-22T14:47:41.716Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-22T15:01:02.599Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 19.60, '2025-12-22T15:29:10.879Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.50, '2025-12-22T15:43:44.330Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.80, '2025-12-22T15:58:15.761Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-22T16:08:41.759Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.40, '2025-12-22T18:16:10.927Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.90, '2025-12-22T18:34:39.384Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-22T18:52:19.273Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-22T20:07:39.970Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-22T20:23:50.196Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-22T20:58:55.460Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-22T23:04:42.030Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-22T23:19:48.826Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-22T23:45:45.879Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-23T00:08:13.698Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-23T01:22:17.312Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 17.00, '2025-12-23T02:09:54.330Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-23T02:27:33.851Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.20, '2025-12-23T02:59:48.293Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-23T03:21:17.001Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Gustavo', '2025-12-22T12:34:18.218Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Gustavo';
    END IF;
    
    -- Shift for Felipe at 2025-12-22T13:12:37.895Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Felipe'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-22T13:12:37.895Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '47f4e640-f4ef-4636-9838-3e27c89bf839', '2025-12-22T13:12:37.895Z', '2025-12-23T01:55:41.783Z', 
                30677, 30871, 'finalizado', 
                377.78, 121, 498.78, 
                0, 498.78, 299.268, 199.512,
                37, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.00, '2025-12-22T13:41:10.317Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.10, '2025-12-22T13:56:51.292Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.30, '2025-12-22T14:13:21.864Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.76, '2025-12-22T14:31:18.753Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.80, '2025-12-22T14:55:50.612Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-22T15:08:55.262Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.00, '2025-12-22T15:21:19.741Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.87, '2025-12-22T15:37:32.330Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 8.90, '2025-12-22T15:49:38.252Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.70, '2025-12-22T16:01:29.449Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-22T16:32:27.739Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.90, '2025-12-22T16:43:30.327Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 8.00, '2025-12-22T16:47:23.073Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.30, '2025-12-22T17:10:01.138Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.50, '2025-12-22T17:32:06.739Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 8.00, '2025-12-22T17:44:34.247Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.90, '2025-12-22T18:04:23.801Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.80, '2025-12-22T18:15:27.353Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.60, '2025-12-22T18:35:41.185Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.00, '2025-12-22T18:51:27.316Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 18.00, '2025-12-22T19:13:44.280Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 24.00, '2025-12-22T19:35:36.651Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.00, '2025-12-22T20:59:34.691Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.65, '2025-12-22T21:11:50.817Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.80, '2025-12-22T21:23:31.291Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.60, '2025-12-22T21:46:17.081Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-22T22:05:14.065Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 53.40, '2025-12-22T22:49:28.622Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.40, '2025-12-22T23:14:21.392Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 8.00, '2025-12-22T23:41:20.518Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-22T23:58:29.618Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 8.30, '2025-12-23T00:12:34.049Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.00, '2025-12-23T00:27:15.390Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 24.00, '2025-12-23T00:50:25.506Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 8.00, '2025-12-23T01:04:27.928Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.20, '2025-12-23T01:22:48.133Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.00, '2025-12-23T01:38:29.821Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Felipe', '2025-12-22T13:12:37.895Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Felipe';
    END IF;
    
    -- Shift for Felipe at 2025-12-23T01:56:09.370Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Felipe'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-23T01:56:09.370Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-23T01:56:09.370Z', '2025-12-23T04:40:25.262Z', 
                43199, 43233, 'finalizado', 
                65.82, 12, 77.82, 
                0, 77.82, 46.692, 31.128,
                6, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.50, '2025-12-23T02:09:55.647Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 24.07, '2025-12-23T02:42:32.242Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.50, '2025-12-23T03:03:17.111Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 12.00, '2025-12-23T03:21:12.649Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.95, '2025-12-23T03:32:38.940Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 8.80, '2025-12-23T03:48:44.450Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Felipe', '2025-12-23T01:56:09.370Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Felipe';
    END IF;
    
    -- Shift for Gustavo at 2025-12-23T12:36:08.738Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Gustavo'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-23T12:36:08.738Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '40675965-5401-4f1b-adb3-6f0c64dccb5c', '2025-12-23T12:36:08.738Z', '2025-12-24T04:35:40.000Z', 
                21509, 21647, 'finalizado', 
                128.86, 254, 382.86, 
                0, 382.86, 229.716, 153.144,
                22, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-23T13:36:04.111Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-23T15:55:18.634Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.90, '2025-12-23T16:21:30.109Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-23T17:09:10.001Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-23T17:14:43.715Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-23T18:38:30.580Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-23T18:47:21.242Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-23T20:00:24.194Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 80.00, '2025-12-23T20:16:15.071Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.80, '2025-12-23T20:38:31.244Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.80, '2025-12-23T20:51:38.826Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.00, '2025-12-23T21:36:30.283Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-23T22:47:56.748Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.00, '2025-12-23T23:31:27.898Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-23T23:42:26.828Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-23T23:54:03.120Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-24T00:11:57.200Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.80, '2025-12-24T02:22:50.087Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 24.20, '2025-12-24T03:03:11.179Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.16, '2025-12-24T03:59:50.680Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-24T04:00:02.088Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.20, '2025-12-24T04:21:28.442Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Gustavo', '2025-12-23T12:36:08.738Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Gustavo';
    END IF;
    
    -- Shift for Luan at 2025-12-23T13:02:26.283Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Luan'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-23T13:02:26.283Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '47f4e640-f4ef-4636-9838-3e27c89bf839', '2025-12-23T13:02:26.283Z', '2025-12-24T05:22:24.627Z', 
                30886, 31107, 'finalizado', 
                324.5, 114, 438.5, 
                0, 438.5, 263.1, 175.4,
                31, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-23T13:02:33.609Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.30, '2025-12-23T13:21:23.565Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-23T13:57:20.974Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.50, '2025-12-23T14:16:43.742Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.70, '2025-12-23T14:48:47.899Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 12.00, '2025-12-23T15:05:36.810Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.70, '2025-12-23T15:36:04.109Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 19.60, '2025-12-23T15:56:00.551Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.80, '2025-12-23T16:03:16.758Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-23T17:10:36.259Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.70, '2025-12-23T17:36:40.019Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.40, '2025-12-23T17:52:08.239Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.80, '2025-12-23T18:04:59.980Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.40, '2025-12-23T18:21:08.336Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.20, '2025-12-23T18:27:06.405Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.40, '2025-12-23T18:42:21.583Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 12.00, '2025-12-23T19:05:37.839Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.10, '2025-12-23T20:17:14.283Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.10, '2025-12-23T20:35:59.655Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.90, '2025-12-23T20:53:31.849Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.70, '2025-12-23T21:21:46.176Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-23T23:22:16.352Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 28.70, '2025-12-23T23:52:25.925Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.00, '2025-12-24T00:17:50.426Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.30, '2025-12-24T00:30:38.232Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.40, '2025-12-24T01:15:39.858Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.10, '2025-12-24T01:28:06.827Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.10, '2025-12-24T01:40:07.512Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.60, '2025-12-24T02:06:01.445Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-24T03:13:59.997Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-24T04:14:42.227Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Luan', '2025-12-23T13:02:26.283Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Luan';
    END IF;
    
    -- Shift for Robson at 2025-12-23T14:48:59.047Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Robson'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-23T14:48:59.047Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-23T14:48:59.047Z', '2025-12-24T04:08:35.090Z', 
                43252, 43406, 'finalizado', 
                205.8, 148, 353.8, 
                0, 353.8, 212.28, 141.52,
                27, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.30, '2025-12-23T14:49:16.709Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.00, '2025-12-23T15:20:20.093Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-23T15:32:25.024Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 30.00, '2025-12-23T15:57:19.322Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.00, '2025-12-23T16:28:10.690Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.50, '2025-12-23T16:49:34.856Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-23T16:53:34.810Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.10, '2025-12-23T18:23:19.880Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.50, '2025-12-23T18:40:30.042Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.00, '2025-12-23T19:00:31.323Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.80, '2025-12-23T19:21:19.225Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.00, '2025-12-23T19:31:58.541Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 13.00, '2025-12-23T19:43:21.106Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-23T21:02:19.170Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.10, '2025-12-23T21:37:44.178Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-23T23:02:18.686Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 10.20, '2025-12-23T23:20:56.653Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.50, '2025-12-23T23:39:20.711Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 16.00, '2025-12-24T00:19:55.177Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-24T00:38:53.562Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 14.00, '2025-12-24T01:13:03.196Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.60, '2025-12-24T01:58:00.208Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.50, '2025-12-24T02:15:39.048Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.30, '2025-12-24T02:37:02.867Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-24T03:21:31.872Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.40, '2025-12-24T03:44:30.925Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.00, '2025-12-24T04:05:35.372Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Robson', '2025-12-23T14:48:59.047Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Robson';
    END IF;
    
    -- Shift for Luan at 2025-12-24T13:37:08.551Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Luan'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-24T13:37:08.551Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '47f4e640-f4ef-4636-9838-3e27c89bf839', '2025-12-24T13:37:08.551Z', '2025-12-25T01:31:36.812Z', 
                31114, 31284, 'finalizado', 
                303.7, 122, 425.7, 
                0, 425.7, 255.42, 170.28,
                26, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-24T13:55:49.426Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.40, '2025-12-24T14:18:04.074Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.20, '2025-12-24T14:45:32.196Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.30, '2025-12-24T15:21:31.816Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.40, '2025-12-24T16:12:36.538Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.30, '2025-12-24T16:25:33.699Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 25.00, '2025-12-24T16:29:32.957Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.40, '2025-12-24T16:45:48.159Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.20, '2025-12-24T16:58:12.132Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.80, '2025-12-24T17:11:41.611Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.50, '2025-12-24T17:27:17.243Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-24T19:35:27.083Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-24T19:49:19.473Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.20, '2025-12-24T20:03:48.068Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.30, '2025-12-24T20:19:25.979Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 20.00, '2025-12-24T20:39:32.686Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 21.60, '2025-12-24T20:57:38.571Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.70, '2025-12-24T21:07:38.537Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 15.50, '2025-12-24T21:26:34.275Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.20, '2025-12-24T21:46:42.530Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 18.10, '2025-12-24T22:09:52.140Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.70, '2025-12-24T22:22:06.815Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 12.00, '2025-12-24T22:44:56.084Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-24T23:26:54.212Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 21.90, '2025-12-25T00:12:38.952Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 10.00, '2025-12-25T00:28:04.771Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Luan', '2025-12-24T13:37:08.551Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Luan';
    END IF;
    
    -- Shift for Felipe at 2025-12-24T17:40:17.708Z
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Felipe'));
    
    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = '2025-12-24T17:40:17.708Z') THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim, 
                km_inicial, km_final, status, 
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, '870dec1b-da4c-4e2e-89b9-638678dd864c', '2025-12-24T17:40:17.708Z', '2025-12-25T03:33:29.222Z', 
                43406, 43564, 'finalizado', 
                265.44, 127, 392.44, 
                0, 392.44, 235.464, 156.976,
                24, 0, 0
            ) RETURNING id INTO v_shift_id;
            
            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-24T18:05:56.908Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.90, '2025-12-24T18:22:20.658Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 9.59, '2025-12-24T19:01:56.057Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.60, '2025-12-24T19:17:27.011Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.30, '2025-12-24T19:31:35.521Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.30, '2025-12-24T20:10:06.454Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.00, '2025-12-24T20:46:58.690Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-24T20:56:28.453Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.00, '2025-12-24T22:05:31.578Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.25, '2025-12-24T22:21:38.188Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.00, '2025-12-24T22:39:09.970Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 40.00, '2025-12-24T23:46:52.725Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 12.00, '2025-12-24T23:59:08.353Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.30, '2025-12-25T00:09:41.502Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.50, '2025-12-25T00:27:03.156Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 16.00, '2025-12-25T00:44:17.138Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 12.00, '2025-12-25T00:54:19.733Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 17.00, '2025-12-25T01:22:55.443Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 13.20, '2025-12-25T01:35:41.224Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 14.20, '2025-12-25T01:50:37.892Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'APP', 11.30, '2025-12-25T02:06:43.942Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 15.00, '2025-12-25T02:23:02.868Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 50.00, '2025-12-25T03:20:15.800Z');
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, 'PARTICULAR', 20.00, '2025-12-25T03:23:35.302Z');
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', 'Felipe', '2025-12-24T17:40:17.708Z';
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', 'Felipe';
    END IF;
    
END $$;
