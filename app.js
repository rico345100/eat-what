window.onload = function() {
	window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;
	
	var AppShakeEvent = new Shake({
		threshold: 5,
		timeout: 200
	});

	AppShakeEvent.start();

	var debugText = document.getElementById('debug');
	var canvas = document.getElementById('canvas');
	var options = ["오쇼분식","집밥","키친요미","베트남","더도이","맥도날드","맘스터치","멸치국수","굶어"];
	
	var startAngle = 0;
	var arc = Math.PI / (options.length / 2);
	var spinTimeout = null;
	
	var spinAngleStart = 0;
	var spinTime = 0;
	var spinTimeTotal = 0;

	var ctx;
		
	function printText(text) {
		debugText.innerHTML += '<p>' + text + '</p>';
	}
	function byte2Hex(n) {
		var nybHexString = "0123456789ABCDEF";
		return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
	}

	function RGB2Color(r,g,b) {
		return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
	}

	function getColor(item, maxitem) {
		var phase = 0;
		var center = 128;
		var width = 127;
		var frequency = Math.PI*2/maxitem;

		red   = Math.sin(frequency*item+2+phase) * width + center;
		green = Math.sin(frequency*item+0+phase) * width + center;
		blue  = Math.sin(frequency*item+4+phase) * width + center;

		return RGB2Color(red,green,blue);
	}
	
	function drawRouletteWheel() {
		if (canvas.getContext) {
			var outsideRadius = 140;
			var textRadius = 105;
			var insideRadius = 80;

			ctx = canvas.getContext("2d");
			ctx.clearRect(0,0,200,200);

			ctx.strokeStyle = "black";
			ctx.lineWidth = 2;

			ctx.font = 'bold 12px Helvetica, Arial';

			for(var i = 0; i < options.length; i++) {
				var angle = startAngle + i * arc;
				ctx.fillStyle = getColor(i, options.length);

				ctx.beginPath();
				ctx.arc(150, 150, outsideRadius, angle, angle + arc, false);
				ctx.arc(150, 150, insideRadius, angle + arc, angle, true);
				ctx.stroke();
				ctx.fill();

				ctx.save();
				ctx.shadowOffsetX = -1;
				ctx.shadowOffsetY = -1;
				ctx.shadowBlur    = 0;
				ctx.shadowColor   = "rgb(220,220,220)";
				ctx.fillStyle = "black";
				ctx.translate(150 + Math.cos(angle + arc / 2) * textRadius, 
							150 + Math.sin(angle + arc / 2) * textRadius);
				ctx.rotate(angle + arc / 2 + Math.PI / 2);
				var text = options[i];
				ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
				ctx.restore();
			} 

			//Arrow
			ctx.fillStyle = "black";
			ctx.beginPath();
			ctx.moveTo(150 - 4, 150 - (outsideRadius + 5));
			ctx.lineTo(150 + 4, 150 - (outsideRadius + 5));
			ctx.lineTo(150 + 4, 150 - (outsideRadius - 5));
			ctx.lineTo(150 + 9, 150 - (outsideRadius - 5));
			ctx.lineTo(150 + 0, 150 - (outsideRadius - 13));
			ctx.lineTo(150 - 9, 150 - (outsideRadius - 5));
			ctx.lineTo(150 - 4, 150 - (outsideRadius - 5));
			ctx.lineTo(150 - 4, 150 - (outsideRadius + 5));
			ctx.fill();
		}
	}
	
	function spin() {
		spinAngleStart = Math.random() * 10 + 10;
		spinTime = 0;
		spinTimeTotal = Math.random() * 3 + 4 * 1000;
		rotateWheel();
	}
	
	function rotateWheel() {
		spinTime += 30;
		
		if(spinTime >= spinTimeTotal) {
			stopRotateWheel();
			return;
		}
		
		var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
		startAngle += (spinAngle * Math.PI / 180);
		
		drawRouletteWheel();
		spinTimeout = requestAnimationFrame(rotateWheel, 30);
	}
	
	function stopRotateWheel() {
		cancelAnimationFrame(spinTimeout);
		
		var degrees = startAngle * 180 / Math.PI + 90;
		var arcd = arc * 180 / Math.PI;
		var index = Math.floor((360 - degrees % 360) / arcd);
		
		ctx.save();
		ctx.font = 'bold 20px Helvetica, Arial';
		var text = options[index]
		
		ctx.fillText(text, 150 - ctx.measureText(text).width / 2, 150 + 10);
		ctx.restore();
	}
	
	function easeOut(t, b, c, d) {
		var ts = (t/=d)*t;
		var tc = ts*t;
		
		return b+c*(tc + -1*ts + 1*t);
	}
	
	drawRouletteWheel();

	
	window.addEventListener('shake', function() {
		cancelAnimationFrame(spinTimeout);
		spin();
	}, false);
};