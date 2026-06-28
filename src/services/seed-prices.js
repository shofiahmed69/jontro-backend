const prisma = require('./db');

const pricingData = [
    {
        slug: "custom-software-development",
        priceMinUsd: 5000,
        priceMaxUsd: 25000,
        priceMinEur: 4500,
        priceMaxEur: 23000,
        priceMinBdt: 500000,
        priceMaxBdt: 2500000,
        priceMin: 5000,
        priceMax: 25000
    },
    {
        slug: "ai-agent-development",
        priceMinUsd: 8000,
        priceMaxUsd: 35000,
        priceMinEur: 7500,
        priceMaxEur: 32000,
        priceMinBdt: 800000,
        priceMaxBdt: 3500000,
        priceMin: 8000,
        priceMax: 35000
    },
    {
        slug: "workflow-automation",
        priceMinUsd: 3000,
        priceMaxUsd: 12000,
        priceMinEur: 2800,
        priceMaxEur: 11000,
        priceMinBdt: 300000,
        priceMaxBdt: 1200000,
        priceMin: 3000,
        priceMax: 12000
    },
    {
        slug: "saas-product-development",
        priceMinUsd: 15000,
        priceMaxUsd: 60000,
        priceMinEur: 14000,
        priceMaxEur: 55000,
        priceMinBdt: 1500000,
        priceMaxBdt: 6000000,
        priceMin: 15000,
        priceMax: 60000
    },
    {
        slug: "mobile-app-development",
        priceMinUsd: 10000,
        priceMaxUsd: 30000,
        priceMinEur: 9000,
        priceMaxEur: 28000,
        priceMinBdt: 1000000,
        priceMaxBdt: 3000000,
        priceMin: 10000,
        priceMax: 30000
    },
    {
        slug: "cloud-api-systems",
        priceMinUsd: 6000,
        priceMaxUsd: 20000,
        priceMinEur: 5500,
        priceMaxEur: 18000,
        priceMinBdt: 600000,
        priceMaxBdt: 2000000,
        priceMin: 6000,
        priceMax: 20000
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
