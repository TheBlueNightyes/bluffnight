import { createCanvas } from 'canvas';

export function generateStockChart(history) {
    const width = 600;
    const height = 300;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (!history || history.length < 2) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.fillText('Not enough data', 200, 150);
        return canvas.toBuffer();
    }

    const max = Math.max(...history);
    const min = Math.min(...history);

    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const stepX = graphWidth / (history.length - 1);

    const scaleY = (value) =>
        padding + graphHeight - ((value - min) / (max - min)) * graphHeight;

    // line style
    ctx.strokeStyle = '#00b0f4';
    ctx.lineWidth = 3;
    ctx.beginPath();

    history.forEach((value, i) => {
        const x = padding + i * stepX;
        const y = scaleY(value);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Max: ${max.toFixed(2)}`, 10, 20);
    ctx.fillText(`Min: ${min.toFixed(2)}`, 10, height - 10);

    return canvas.toBuffer();
}