export const processSalesData = (data: any[]) => {
    const documentStyle = getComputedStyle(document.documentElement);

    // Define the type for monthlySales grouped by region and month
    const monthlySales: Record<string, Record<string, number>> = {};  // Grouped by region and month

    // Iterate over the data and accumulate the quantities by region and month
    data.forEach(item => {
        const shopId = item.shop_id;  // Use shop_id
        const month = new Date(item.fulldate).toLocaleString('default', { month: 'long', year: 'numeric' });  // Format to "Month Year" (e.g., "January 2024")
        const category = item.category_name;
        const quantity = item.quantity;
        const region = shopId.split('-')[1];  // Extract the region part of the shop_id

        // Initialize the object for the category and month if not already present
        if (!monthlySales[month]) {
            monthlySales[month] = {};
        }
        if (!monthlySales[month][category]) {
            monthlySales[month][category] = 0;
        }
        if (!monthlySales[month][shopId]) {
            monthlySales[month][shopId] = 0;
        }
        if (!monthlySales[month][region]) {
            monthlySales[month][region] = 0;
        }

        // Accumulate the quantity for this region in the specific month
        monthlySales[month][region] += quantity;

        // Accumulate the quantity for this shop_id in the specific month
        monthlySales[month][shopId] += quantity;

        // Accumulate the quantity for this category in the specific month
        monthlySales[month][category] += quantity;
    });

    const colorKeys = [
        '--p-primary-100', '--p-primary-200', '--p-primary-300',
        '--p-primary-400', '--p-primary-500', '--p-primary-600', '--p-primary-700',
        '--p-primary-800', '--p-primary-900'
    ];

    // Function to get a random color from the CSS custom properties
    const getRandomColor = () => {
        const randomIndex = Math.floor(Math.random() * colorKeys.length);
        return documentStyle.getPropertyValue(colorKeys[randomIndex]);
    };

    const months = Object.keys(monthlySales);  // Get list of months
    const categories = [...new Set(data.map(item => item.category_name))];  // Get unique category names
    const shopIds = [...new Set(data.map(item => item.shop_id))];
    const regions = [...new Set(data.map(item => item.shop_id.split('-')[1]))];  // Get unique regions by extracting the region part of shop_id

    // Prepare the line chart data (Sales over time for each category)
    const lineData = {
        labels: months,  // X-axis will be months
        datasets: categories.map(category => {
            const color = getRandomColor();  // Random color for this category
            return {
                label: category,
                data: months.map(month => monthlySales[month][category] || 0),  // Get quantity for this category and month
                backgroundColor: color,  // Same color for background and border
                borderColor: color,  // Same color for border
                tension: 0.4
            };
        })
    };

    const lineOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: documentStyle.getPropertyValue('--text-color')
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: documentStyle.getPropertyValue('--text-color-secondary')
                },
                grid: {
                    color: documentStyle.getPropertyValue('--surface-border'),
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: documentStyle.getPropertyValue('--text-color-secondary')
                },
                grid: {
                    color: documentStyle.getPropertyValue('--surface-border'),
                    drawBorder: false
                }
            }
        }
    };

    // Prepare the bar chart data (Total quantity per region in each month)
    const barData = {
        labels: regions,  // X-axis will be regions
        datasets: months.map(month => {
            const color = getRandomColor();  // Random color for each month
            return {
                label: month,
                data: regions.map(region => monthlySales[month][region] || 0),  // Get total quantity for this region and month
                backgroundColor: color,  // Same color for background and border
                borderColor: color,  // Same color for border
            };
        })
    };

    const barOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Quantity' }
            },
            x: {
                title: { display: true, text: 'Region' }
            }
        }
    };

    return { lineData, lineOptions, barData, barOptions };
};
