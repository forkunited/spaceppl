var drawBoxes = function(ctx, boxes) {
    var drawBox = function(box) {
        ctx.beginPath();
        ctx.rect(box.x, box.y, box.w, box.h);
        ctx.fillStyle = box.color;
        ctx.fill();
        ctx.stroke();
    }

    for (var i = 0; i < boxes.length; i++)
        drawBox(boxes[i]);
};

var drawLily = function(ctx, lily) {
    var img = new Image;
    img.onload = function() {
        ctx.drawImage(img, lily.x, lily.y, lily.w, lily.h); //adjust for size of lily
    }
    img.src = "lotus.png"
};

var drawPoint = function(ctx, point) {
    ctx.beginPath();
    ctx.rect(point.x - 5, point.y - 5, 10, 10);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.stroke();
};

var drawScreen = function(ctx, canvasWidth, canvasHeight, boxes, lily, point) {
    // draw background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,canvasWidth,canvasHeight);

    drawBoxes(ctx, boxes);
    drawLily(ctx, lily);
    drawPoint(ctx, point);
};
