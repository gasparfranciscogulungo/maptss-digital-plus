/**
 * MAPTSS Digital+ Charts and Data Visualization
 * Simple chart implementations without external dependencies
 */

// Simple chart creation utility functions
const ChartsUtil = {
    /**
     * Create a simple SVG-based bar chart
     */
    createBarChart: function(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = options.width || 400;
        const height = options.height || 200;
        const margin = options.margin || { top: 20, right: 20, bottom: 40, left: 40 };

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Create SVG
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
        svg.style.backgroundColor = "#f8fafc";
        svg.style.borderRadius = "8px";

        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.value));

        // Create bars
        data.forEach((item, index) => {
            const barWidth = chartWidth / data.length * 0.8;
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = margin.left + (index * chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
            const y = margin.top + chartHeight - barHeight;

            // Create bar
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("width", barWidth);
            rect.setAttribute("height", barHeight);
            rect.setAttribute("fill", "#3b82f6");
            rect.setAttribute("rx", "4");
            svg.appendChild(rect);

            // Add label
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x + barWidth / 2);
            text.setAttribute("y", height - 10);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-size", "12");
            text.setAttribute("fill", "#64748b");
            text.textContent = item.label;
            svg.appendChild(text);

            // Add value label
            const valueText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            valueText.setAttribute("x", x + barWidth / 2);
            valueText.setAttribute("y", y - 5);
            valueText.setAttribute("text-anchor", "middle");
            valueText.setAttribute("font-size", "10");
            valueText.setAttribute("fill", "#1e293b");
            valueText.textContent = item.value;
            svg.appendChild(valueText);
        });

        container.innerHTML = "";
        container.appendChild(svg);
    },

    /**
     * Create a simple donut chart
     */
    createDonutChart: function(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const size = options.size || 200;
        const colors = options.colors || ["#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"];

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);

        const radius = size / 2 - 20;
        const innerRadius = radius * 0.6;
        const centerX = size / 2;
        const centerY = size / 2;

        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;

        data.forEach((item, index) => {
            const angle = (item.value / total) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            // Calculate path
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const x3 = centerX + innerRadius * Math.cos(endAngle);
            const y3 = centerY + innerRadius * Math.sin(endAngle);
            const x4 = centerX + innerRadius * Math.cos(startAngle);
            const y4 = centerY + innerRadius * Math.sin(startAngle);

            const largeArcFlag = angle > Math.PI ? 1 : 0;

            const pathData = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                'Z'
            ].join(' ');

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathData);
            path.setAttribute("fill", colors[index % colors.length]);
            svg.appendChild(path);

            currentAngle += angle;
        });

        container.innerHTML = "";
        container.appendChild(svg);
    }
};

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Dashboard charts for citizen page
    if (document.getElementById('monthly-inscriptions-chart')) {
        const monthlyData = [
            { label: 'Jan', value: 45 },
            { label: 'Fev', value: 52 },
            { label: 'Mar', value: 48 },
            { label: 'Abr', value: 61 },
            { label: 'Mai', value: 55 },
            { label: 'Jun', value: 67 }
        ];
        ChartsUtil.createBarChart('monthly-inscriptions-chart', monthlyData);
    }

    // Dashboard charts for manager page
    if (document.getElementById('inscricoes-chart')) {
        const inscricoesData = [
            { label: 'Jan', value: 850 },
            { label: 'Fev', value: 920 },
            { label: 'Mar', value: 1100 },
            { label: 'Abr', value: 980 },
            { label: 'Mai', value: 1250 },
            { label: 'Jun', value: 1150 }
        ];
        ChartsUtil.createBarChart('inscricoes-chart', inscricoesData, { width: 500, height: 250 });
    }

    if (document.getElementById('distribuicao-chart')) {
        const distribuicaoData = [
            { label: 'Luanda', value: 45 },
            { label: 'Benguela', value: 20 },
            { label: 'Huambo', value: 15 },
            { label: 'Outros', value: 20 }
        ];
        ChartsUtil.createDonutChart('distribuicao-chart', distribuicaoData, { size: 250 });
    }
});

// Export for global use
window.ChartsUtil = ChartsUtil;