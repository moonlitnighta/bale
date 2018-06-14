!function (modules){
    var installedModules = {};

    function __bale_require__(id){
        if(installedModules[id]){
            return installedModules[id].exports;
        }

        var module = installedModules[id] = {
            exports:{}
        };

        modules[id].call(module.exports , module , module.exports , __bale_require__);

        return module.exports;
    }

    __bale_require__("/entry-bale-id/");
}({/bale-chunks/})