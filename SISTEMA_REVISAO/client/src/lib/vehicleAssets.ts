
import { Car } from "lucide-react";

/**
 * Catálogo de Imagens de Veículos
 * Mapeia o MODELO do veículo para uma imagem estática.
 * Isso evita salvar imagens pesadas (base64) no banco de dados.
 */

// Mapeamento por MODELO (Genérico) - Imagens Externas (Solicitação do Usuário)
const CAR_IMAGES_BY_MODEL: Record<string, string> = {
    // Hatches Compactos
    "hb20": "https://s3.amazonaws.com/rap-lix-pelle-images/vehicles/versions/604505f0d9a6c.jpg",
    "onix": "https://s3.amazonaws.com/rap-lix-pelle-images/vehicles/versions/5f9725f0a0d92.jpg",
    "kwid": "https://s3.amazonaws.com/rap-lix-pelle-images/vehicles/versions/63c5a7065f3f4.jpg",
    "gol": "https://s3.amazonaws.com/rap-lix-pelle-images/vehicles/versions/5b6b47c6443c2.jpg",
    "mobi": "https://s3.amazonaws.com/rap-lix-pelle-images/vehicles/versions/5f972b9d03889.jpg",
    "argo": "https://s3.amazonaws.com/rap-lix-pelle-images/vehicles/versions/5f9729a4a754b.jpg",
    "cronos": "https://s3.amazonaws.com/rap-lix-pelle-images/vehicles/versions/5f9729a4a754b.jpg",
    "voyage": "https://s3.amazonaws.com/rap-lix-pelle-images/vehicles/versions/5b6b47c6443c2.jpg",
    "logan": "https://s3.amazonaws.com/rap-lix-pelle-images/vehicles/versions/63c5a7065f3f4.jpg",
    "sandero": "https://s3.amazonaws.com/rap-lix-pelle-images/vehicles/versions/63c5a7065f3f4.jpg",

    // Picapes (Ford Maverick - Branco)
    "maverique": "https://www.autoo.com.br/fotos/2021/8/1280_960/ford_maverick_2022_4_30082021_50117_1280_960.jpg",
    "maverick": "https://www.autoo.com.br/fotos/2021/8/1280_960/ford_maverick_2022_4_30082021_50117_1280_960.jpg",

    // Elétricos / BYD Dolphin Mini (Padrão: Branco)
    "dolphi": "https://i0.wp.com/meugodrive.wpcomstaging.com/wp-content/uploads/2024/12/dolphin-mini-byd.webp?fit=800%2C400&ssl=1",
    "dolphin": "https://i0.wp.com/meugodrive.wpcomstaging.com/wp-content/uploads/2024/12/dolphin-mini-byd.webp?fit=800%2C400&ssl=1",
    "byd": "https://i0.wp.com/meugodrive.wpcomstaging.com/wp-content/uploads/2024/12/dolphin-mini-byd.webp?fit=800%2C400&ssl=1",
};

// Mapeamento Específico por PLACA (Override)
const CAR_IMAGES_BY_PLATE: Record<string, string> = {
    // BYD Dolphin Mini Branco
    "TQS4C30": "https://i0.wp.com/meugodrive.wpcomstaging.com/wp-content/uploads/2024/12/dolphin-mini-byd.webp?fit=800%2C400&ssl=1",
    "TQU0H17": "https://i0.wp.com/meugodrive.wpcomstaging.com/wp-content/uploads/2024/12/dolphin-mini-byd.webp?fit=800%2C400&ssl=1",

    // BYD Dolphin Mini Azul / Preto
    "TQQ0A07": "https://www.byd.com/content/dam/byd-site/br/news-byd-brasil/byd-dolphin-mini.webp", // Azul Escuro (Site BYD)
    "TQQ0A94": "https://garagem360.com.br/wp-content/uploads/2024/06/dolphin-mini-2.jpg", // Preto (Garagem360)
};

// Imagem padrão (Silhouette Branca para fundo escuro)
const DEFAULT_CAR_IMAGE = "https://cdn-icons-png.flaticon.com/512/55/55283.png";

export function getVehicleImage(modelo: string, placa?: string): string {
    // 1. Tenta buscar por PLACA exata primeiro
    if (placa) {
        // Normaliza placa (remove hífens, uppercase)
        const cleanPlate = placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        if (CAR_IMAGES_BY_PLATE[cleanPlate]) {
            return CAR_IMAGES_BY_PLATE[cleanPlate];
        }
    }

    // 2. Tenta buscar por MODELO
    if (!modelo) return DEFAULT_CAR_IMAGE;

    // Normaliza para buscar no mapa (lowercase, remove espaços extras)
    const normalized = modelo.toLowerCase().trim();

    // Tenta encontrar correspondência parcial (ex: "HB20 Comfort" -> match em "hb20", "Dolphi Mini" -> match em "dolphi")
    const key = Object.keys(CAR_IMAGES_BY_MODEL).find(k => normalized.includes(k));

    return key ? CAR_IMAGES_BY_MODEL[key] : DEFAULT_CAR_IMAGE;
}

export function getVehicleColor(modelo: string): string {
    // Poderíamos mapear cores também se quiséssemos
    return "#ffffff";
}

export function resolveVehicleImage(vehicle: { imageUrl?: string | null, modelo: string, plate?: string }): string {
    if (vehicle.imageUrl) return vehicle.imageUrl;
    return getVehicleImage(vehicle.modelo, vehicle.plate);
}
