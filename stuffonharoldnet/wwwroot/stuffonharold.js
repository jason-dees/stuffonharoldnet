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
            this.length = 2;
            this.parent = haroldsElement;
            
            this.addImageElement().then(() => self.addImageElement());
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
            var haroldImage = new HaroldImg();
            haroldImage.src = URL.createObjectURL(blob);
            self.images.push(haroldImage);
            self.parent.appendChild(haroldImage.Element);
        }
    }

    var Directions = {
        Left: 1,
        Right: 2,
        Shake: 3 
    }
    
    class DirectionInformation {
        constructor() { }

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
                sendDirection(Directions.Shake);
            }
        });

        return;
    }

    function addSwipeListener(harolds, nextEvent){
        
        let haroldImage = () => harolds.firstChild;
        let start = {x: 0, y: 0};
        let previous = {x: 0, y: 0};
        let isDown = false;
        let velocity = {x: 0, y: 0};
        let nextAreaPadding = window.innerWidth * nextAreaPercent;
        let nextArea = {
            left: nextAreaPadding,
            right: window.innerWidth - nextAreaPadding
        };
        var startMovementFn = function(e){
            if(isInNextPadding(getPoint(e))){
                return;
            }
            e.preventDefault();
            haroldImage().classList.add('drag');
            start = getPoint(e);
            previous = start;
            isDown = true;
        }

        var preventDefault = function(e){ e.preventDefault();}
        addEventListener(harolds, ['mousedown', 'touchstart'], startMovementFn);
        let nextEventWrapper = (point) => {
            nextEvent();
            if (isInLeftPadding(point)) sendDirection(Directions.Left);
            if (isInRightPadding(point)) sendDirection(Directions.Right);
        };

        harolds.addEventListener("dragstart", preventDefault);
        harolds.addEventListener("drag", preventDefault); 
        var downFn = function(e){
            if(isDown){
                var currentPoint = getPoint(e);
                if(isInNextPadding(current)){
                    nextEventWrapper(currentPoint);
                    dragDone();
                    return;
                }
                var offset = calculateOffset(previous, currentPoint);
                setOffsetPosition(haroldImage(), offset);
                previous = currentPoint;
            }
        };
        addEventListener(harolds, ['mousemove', 'touchmove'], downFn);

        addEventListener(harolds, ['mouseup', 'touchend'], dragDone);
        addEventListener(harolds, 'click', function(e){
            let currentPoint = getPoint(e);
            if (isInNextPadding(currentPoint)){
                dragDone();
                nextEventWrapper(currentPoint);
            }
        });

        function calculateOffset(start, end){
            return {x: start.x - end.x, y: start.y - end.y};
        }
        function getPoint(e){
            return {x: e.pageX, y: e.pageY};
        }

        function dragDone(){
            isDown = false;
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

        function isInNextPadding(point) {
            return isInLeftPadding(point) || isInRightPadding(point); 
        }

        let isInLeftPadding = (point) => point.x < nextArea.left;
        let isInRightPadding = (point) => point.x > nextArea.right;

    }

    function addEventListener(element, eventType, fn) {
        if (typeof (eventType) == "object") {
            eventType.forEach(e => {
                addEventListener(element, e, fn);
            });
            return;
        }
        element.addEventListener(eventType, function (e) {
            fn(e);
        });
    }

    function sendDirection(direction) {
        let route = 'api/Event/ImageChanged';
        let changeEvent = {
            Event: direction,
            Image: "UNKNOWN YET"
        };
        fetch(route, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(changeEvent)
        }).then(response => console.log(response));
    }
})();