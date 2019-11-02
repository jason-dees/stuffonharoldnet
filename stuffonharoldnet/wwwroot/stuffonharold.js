(function h(){
    //Custom Elements don't work in Safari
    class HaroldImg {

        constructor() {
            var element = document.createElement('div');
            element.classList.add('harold-img');
            this.Image = new Image();
            element.appendChild(this.Image);

            this.Element = element;
        } 

        remove(){
            this.Element.parentNode.removeChild(this.Element);
		}

        set src(newSrc){
            this.Image.src = newSrc;
        }
        get src(){
            return this.Image.src;
        }
    }

    class HaroldImageQueue{
        constructor(haroldsElement){
            var self = this;
            this.images = [];
            this.length = 3;
			this.parent = haroldsElement;
			this.total = 0;
            
			(function addHarold(haroldsLeft) {
				if (haroldsLeft == 0) { return; }
				console.log("adding harold", haroldsLeft);
				self.addImageElement()
					.then(function () {
						addHarold(--haroldsLeft);
					});
			})(this.length);
			
        }

        addImageElement() {
            var self = this;

            var badIdea = new Date();
            return fetch('/api/image/random?width=' + window.innerWidth + '&height=' + window.innerHeight +'&noo' + badIdea.getMilliseconds())
                .then(response => response.blob())
                .then(self.addNewHarold.bind(self));
        }

        shift(){
            var element = this.images.shift();
            element.remove();
            this.addImageElement();
        }
        addNewHarold(blob){
			var self = this;
			this.total++;
            var haroldImage = new HaroldImg();
            haroldImage.src = URL.createObjectURL(blob);
			self.images.push(haroldImage);
			haroldImage.Element.setAttribute("data-count", this.total);
            self.parent.appendChild(haroldImage.Element);
        }
    }

    var nextAreaPercent = .20;
    function start(){
        var harolds = document.querySelector('#harolds');
        var haroldQueue = new HaroldImageQueue(harolds);
        var nextHarold = haroldQueue.shift.bind(haroldQueue);

        addMotionListener(nextHarold);
        addSwipeListener(harolds, nextHarold);
    }

    start();

    function addMotionListener(shakeEvent){
        var shakeCountX = 0;
        var hasShaken = false;
        window.addEventListener('devicemotion',function(e){
            var accel = e.acceleration;
            var x = Math.abs(accel.x);
            var y = Math.abs(accel.y);
            var z = Math.abs(accel.z);
            if(y>15){
                shakeCountX++;
            }
            else{
                shakeCountX = 0;
            }
            if(shakeCountX<3 && y >15 && !hasShaken){
                hasShaken = true;
                setTimeout(function(){hasShaken = false;},200);
                shakeEvent();
            }
        });

        return;
    }

    function addSwipeListener(harolds, nextEvent){
        
        let haroldImage = () => harolds.firstChild;
        let start = {x: 0, y: 0};
        let previous = {x: 0, y: 0};
        let isDown = false;
		let velocity = { x: 0, y: 0 };
		let nextArea;
		let nextAreaCalculation = function () {
			let nextAreaPadding = window.innerWidth * nextAreaPercent;
			nextArea = {
				left: nextAreaPadding,
				right: window.innerWidth - nextAreaPadding
			};
		};
		addEventListener(window, 'resize', function () { nextAreaCalculation(); console.log("resize"); });
		nextAreaCalculation();
		let isInNextPadding = function (point) {
			return point.x > nextArea.right || point.x < nextArea.left;
		};
		var activateDropAreas = function(){
			let dropAreas = document.getElementsByClassName('drop-area');
            for(var i = 0; i < dropAreas.length; i++){
                dropAreas[i].classList.add('active');
            }
		};
		var deactivateDropAreas = function(){
            let dropAreas = document.getElementsByClassName('drop-area');
            for(var i = 0; i < dropAreas.length; i++){
                dropAreas[i].classList.remove('active');
            }
		};
        var startMovementFn = function(e){
            if(isInNextPadding(getPoint(e))){
                return;
            }
            e.preventDefault();
            haroldImage().classList.add('drag');
			start = getPoint(e);
			console.log(start);
            previous = start;
            isDown = true;
            activateDropAreas();
        }

        var preventDefault = function(e){ e.preventDefault();}
        addEventListener(harolds, ['mousedown', 'touchstart'], startMovementFn);

        harolds.addEventListener("dragstart", preventDefault);
        harolds.addEventListener("drag", preventDefault); 
		var downFn = function (e) {
            if(isDown){
				var current = getPoint(e);
				if (isInNextPadding(current)) {
                    nextEvent();
                    dragDone();
                    return;
                }
                var offset = calculateOffset(previous, current);
                setOffsetPosition(haroldImage(), offset);
                previous = current;
            }
        };
		addEventListener(harolds, ['mousemove', 'touchmove'], downFn);

        addEventListener(harolds, ['mouseup', 'touchend'], dragDone);
        addEventListener(harolds, 'click', function(e){
            console.log("Click")
            if(isInNextPadding(getPoint(e))){
                dragDone();
                nextEvent();
            }
        });

        function calculateOffset(start, end){
            return {x: start.x - end.x, y: start.y - end.y};
        }
		function getPoint(e) {
			switch (e.type) {
				case "mousedown":
				case "mousemove":
				case "click":
					return { x: e.pageX, y: e.pageY };
				case "touchstart":
				case "touchmove":
					return { x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY };
			}
			console.warn("Unrecognized event", e);
			return {};
        }

        function dragDone(){
            isDown = false;
            deactivateDropAreas();
            haroldImage().style.position = "relative";
            haroldImage().style.left = "auto";
            haroldImage().style.top = "auto";
            haroldImage().classList.remove('drag');
        }

        function setOffsetPosition(element, offset){
            var position = getPosition(element);
            element.style.position = "relative";
            var left = (offset.x * -1 + position.x);
            var top = (offset.y * -1 + position.y + window.scrollY);
            element.style.left = left + "px";
            element.style.top =  top + "px";
        }

        function getPosition(element){
            var rect = element.getBoundingClientRect();
            return {x: rect.left, y: rect.top};
        }

    }


    function addEventListener(element, eventType, fn){
        if(typeof(eventType) == "object"){
            eventType.forEach(e => {
                addEventListener(element, e, fn);
            });
            return;
        }
        element.addEventListener(eventType, function(e){
            fn(e);
        });
    }


})();