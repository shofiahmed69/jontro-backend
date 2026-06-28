const prisma = require('./db');

const pricingData = [
    {
        slug: "custom-software-development",
        priceMinUsd: 290,
        priceMaxUsd: 1450,
        priceMinEur: 270,
        priceMaxEur: 1350,
        priceMinBdt: 30000,
        priceMaxBdt: 150000,
        priceMin: 290,
        priceMax: 1450
    },
    {
        slug: "ai-agent-development",
        priceMinUsd: 390,
        priceMaxUsd: 2450,
        priceMinEur: 360,
        priceMaxEur: 2250,
        priceMinBdt: 40000,
        priceMaxBdt: 250000,
        priceMin: 390,
        priceMax: 2450
    },
    {
        slug: "workflow-automation",
        priceMinUsd: 149,
        priceMaxUsd: 790,
        priceMinEur: 135,
        priceMaxEur: 730,
        priceMinBdt: 15000,
        priceMaxBdt: 80000,
        priceMin: 149,
        priceMax: 790
    },
    {
        slug: "saas-product-development",
        priceMinUsd: 790,
        priceMaxUsd: 4450,
        priceMinEur: 730,
        priceMaxEur: 4150,
        priceMinBdt: 80000,
        priceMaxBdt: 450000,
        priceMin: 790,
        priceMax: 4450
    },
    {
        slug: "mobile-app-development",
        priceMinUsd: 590,
        priceMaxUsd: 3450,
        priceMinEur: 550,
        priceMaxEur: 3200,
        priceMinBdt: 60000,
        priceMaxBdt: 350000,
        priceMin: 590,
        priceMax: 3450
    },
    {
        slug: "cloud-api-systems",
        priceMinUsd: 249,
        priceMaxUsd: 1190,
        priceMinEur: 230,
        priceMaxEur: 1100,
        priceMinBdt: 25000,
        priceMaxBdt: 120000,
        priceMin: 249,
        priceMax: 1190
    }
];

async function seedPrices() {
    console.log("Starting multi-currency price seeding...");
    for (const item of pricingData) {
        try {
            const service = await prisma.service.findUnique({
                where: { slug: item.slug }
            });
            if (service) {
                await prisma.service.update({
                    where: { slug: item.slug },
                    data: {
                        priceMinUsd: item.priceMinUsd,
                        priceMaxUsd: item.priceMaxUsd,
                        priceMinEur: item.priceMinEur,
                        priceMaxEur: item.priceMaxEur,
                        priceMinBdt: item.priceMinBdt,
                        priceMaxBdt: item.priceMaxBdt,
                        priceMin: item.priceMin,
                        priceMax: item.priceMax
                    }
                });
                console.log(`Updated pricing for ${item.slug}`);
            } else {
                console.log(`Service with slug ${item.slug} not found in database.`);
            }
        } catch (error) {
            console.error(`Error updating pricing for ${item.slug}:`, error);
        }
    }
    console.log("Finished price seeding!");
}

module.exports = { seedPrices };
