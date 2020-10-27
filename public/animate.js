$(document).ready(function () {

    window.human = false;

    let _smokeAlpha = 0.02
    let _smokeParticleNum = 10
    

    var canvasEl = document.querySelector('#fireworks');
    var ctx = canvasEl.getContext('2d');
    var numberOfParticules = _smokeParticleNum;
    var pointerX = 0;
    var pointerY = 0;
    var tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
    //var colors = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C'];
    var colors = ['#cccccc', '#eeeeee', '#99999'];

    function setCanvasSize() {

        var _gridCanvasWidth  = _gridColNum * _gridCellWidth + 5
        var _gridCanvasHeight = _gridRowNum * _gridCellHeight + 5
        canvasEl.width = _gridCanvasWidth*2 //window.innerWidth * 2;
        canvasEl.height = _gridCanvasHeight*2 // window.innerHeight * 2;
        canvasEl.style.width = _gridCanvasWidth // window.innerWidth + 'px';
        canvasEl.style.height = _gridCanvasHeight //window.innerHeight + 'px';
        canvasEl.getContext('2d').scale(2, 2);
    }

    function updateCoords(e) {
        pointerX = e.clientX || e.touches[0].clientX;
        pointerY = e.clientY || e.touches[0].clientY;
    }

    function setParticuleDirection(p) {
        var angle = anime.random(0, 360) * Math.PI / 180;
        var value = anime.random(50, 180);
        var radius = [-1, 1][anime.random(0, 1)] * value;
        return {
            x: p.x + radius * Math.cos(angle),
            y: p.y + radius * Math.sin(angle)
        }
    }

    function createParticule(x,y) {
        var p = {};
        p.x = x;
        p.y = y;
        p.color = colors[anime.random(0, colors.length - 1)];
        p.radius = anime.random(75, 100);
        p.alpha = 0.0
        //p.alpha = anime.random(.2, .4);
        p.endPos = setParticuleDirection(p);
        p.draw = function() {
            ctx.globalAlpha = p.alpha
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
            ctx.fillStyle = p.color;
            ctx.fill();
            //ctx.globalAlpha = 1;
        }
        return p;
    }

    function createCircle(x,y) {
        var p = {};
        p.x = x;
        p.y = y;
        p.color = '#FFF';
        p.radius = 0.1;
        p.alpha = .5;
        p.lineWidth = 6;
        p.draw = function() {
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
            ctx.lineWidth = p.lineWidth;
            ctx.strokeStyle = p.color;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        return p;
    }

    function renderParticule(anim) {
        for (var i = 0; i < anim.animatables.length; i++) {
            anim.animatables[i].target.draw();
        }
    }

    function animateParticules(x, y) {
        //var circle = createCircle(x, y);
        var particules = [];
        for (var i = 0; i < numberOfParticules; i++) {
            particules.push(createParticule(x, y));
        }
        anime.timeline()
            // .add({
            //     targets: particules,
            //     delay: anime.random(0, 500),
                
            //     duration: 100,
            //     easing: 'easeOutExpo',
            //     update: renderParticule
            // })
            .add({
                targets: particules,
                x: function(p) { return p.endPos.x; },
                y: function(p) { return p.endPos.y; },
                radius: 0.1,
                alpha: _smokeAlpha,
                delay: anime.random(0, 2000),
                duration: 4000,// anime.random(3000, 4000),
                easing: 'easeOutExpo',
                update: renderParticule

            })
            // .add({
            //     targets: circle,
            //     radius: anime.random(80, 160),
            //     lineWidth: 0,
            //     alpha: {
            //         value: 0,
            //         easing: 'linear',
            //         duration: anime.random(1200, 1800),  
            //     },
            //     duration: anime.random(2000, 3000),
            //     easing: 'easeOutExpo',
            //     update: renderParticule,
            //     offset: 0
            // });
    }

    var render = anime({
        duration: Infinity,
        update: function() {
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        }
    });

    document.addEventListener(tap, function(e) {
            window.human = true;
            render.play();
            updateCoords(e);
            animateParticules(pointerX, pointerY);

        }, false);

    var centerX = window.innerWidth / 2;
    var centerY = window.innerHeight / 2;

    function autoClick() {
    if (window.human) {
        //animateParticules(pointerX, pointerY);
    }else{
        animateParticules(
            anime.random(centerX-50, centerX+50), 
            anime.random(centerY-50, centerY+50)
        );
        }
        anime({duration: 100}).finished.then(autoClick);
    }

    autoClick();
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize, false);

    setTimeout(() => {
        //d3.select('#cell00').dispatch('click');
    },1000)


    // ******************************************
    // integrate animation with grid

    //pass mouse event to gridcell
    document.addEventListener(tap, function(e) {

        
        var cellx = Math.floor((pointerX-$('#grid').offset().left) / _gridCellWidth)
        var celly = Math.floor((pointerY-$('#grid').offset().top) / _gridCellHeight)

        
        d3.select('#cell' + celly + cellx ).dispatch('click');

    }, false);

    setTimeout( () => {

        function animateStreets(){
            for (var row = 0; row < _gridRowNum; row++) {
                // iterate for cells/columns inside rows
                for (var column = 0; column < _gridColNum; column++) {
                    
                    var cell = _griddata[row][column]
                    if (cell.type.type == "street"){
                        //console.log(cell.type.type,cell.idx[1] *_gridCellWidth, cell.idx[0] *_gridCellHeight)
                        animateParticules(cell.idx[1] * _gridCellWidth + _gridCellWidth/2, cell.idx[0] *_gridCellHeight + _gridCellHeight/2)
                    }
                }
            }
            anime({duration: 500}).finished.then(animateStreets);
        }
        animateStreets()
    },1000)


    console.log($("#timeline"))
    $("#timeline").bind("input",function() {
        console.log("timeline")

        // städtische verkersnahe mikrogramm pm10: 1995: 50 mikrogram, 2018: 20 mikrogramm
        // https://www.umweltbundesamt.de/themen/luft/daten-karten/entwicklung-der-luftqualitaet
        const pm10data = [
            { year: 1995, smokeAlpha: 0.5 , smokeParticleNum:10},
            { year: 2020, smokeAlpha: 0.2 , smokeParticleNum:10}
        ];

        // innerorts NOx Werte seit 1990: https://pudi.lubw.de/detailseite/-/publication/10123
        // 1990: im schnitt 1000 - seit dem immer weiter runter mit der euronorm
        const data = [
            { year: 1990, smokeAlpha: 1.0 , smokeParticleNum:10, text:"NOx bei ca 1000mg (Spanne damals zwischen 400mg bis 1800mg"},
            { year: 1995, smokeAlpha: 0.4 , smokeParticleNum:10, text:"NOx bei ca 400mg (Erste Euro Norm Einführung)"},
            { year: 2000, smokeAlpha: 0.2 , smokeParticleNum:10, text:"NOx bei ca 200mg (Euro 3, Euro Normen werden sukzessive runtergesetzt)"},
            { year: 2005, smokeAlpha: 0.1 , smokeParticleNum:10, text:"NOx bei ca 100mg (Euro 4)"},
            { year: 2010, smokeAlpha: 0.075 , smokeParticleNum:10, text:"NOx bei ca 75mg (Euro 5)"},
            { year: 2015, smokeAlpha: 0.02 , smokeParticleNum:10, text:"NOx bei ca 20mg (Euro 6ab)"},
            { year: 2020, smokeAlpha: 0.02 , smokeParticleNum:10, text:"NOx bei ca 20mg (Euro 6d)"}
        ];

        const entry = data.filter( (e) => e.year === parseInt($(this).val() )) 
        console.log("timeline.entry", entry)
        let entryTxt =  ""
        if (entry.length > 0){
            _smokeAlpha = entry[0].smokeAlpha
            _smokeParticleNum = entry[0].smokeParticleNum
            entryTxt =  entry[0].text
        }

        $("#timelinevalue").text( $(this).val() + " - " + entryTxt);
    });
    
      

});