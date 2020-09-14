var a = (function(){
    
    function a(){
        this.a = 'b';
    }

    a.prototype = {
        clean: function(){
            console.log('clean');
        },
    };

})();


const complete = (x) => x;

