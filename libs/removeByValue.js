module.exports = () => {
    Array.prototype.removeByValue = function(search){
        const index = this.indexOf(search);
        if(index !== -1) this.splice(index, 1);
    };
};