'use strict'

var config = {
    width: 650,
    height: 600,
    type: Phaser.AUTO,
    scene: {
        preload:preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var scene;

var credits = 1000;
var partsList = [];
var partSelected = null;;
var allSubParts;
var partCosts;

var rootNode;
var shopInterface;
var buildInterface;
var buildScreenText;
var pointerOnShop;
var workshopInterfaceX = 325;
var workshopInterfaceY = 300;
var totalPartsListWidth;

var allParts = [];
var allPingGraphics = [];

//Hull widths
var BHW = 340;
var FHW = 168;
var MHW = 249;

var nodeStructure = {
    rootNode:{
        name:'rootNode', x: 0, y: -102.5, subNodes: [
            {part:'middle_hull',x:0,y:0,engaged: false, connectedWith: 'M'}, 
            {part:'front_hull',x:0,y:0,engaged: false, connectedWith: 'M'}, 
            {part:'back_hull',x:0,y:0,engaged: false, connectedWith: 'M'},
        ],
    },
    front_hull:{
        name:'front_hull',subNodes: [
            {part:'middle_hull',x:(MHW+FHW)/2,y:0,engaged: false, connectedWith: 'A'},
            {part:'window',x:30,y:0,engaged: false, connectedWith: 'F'},
            {part:'flair1',x:30,y:-40,engaged: false, connectedWith: 'F'},
            {part:'flair2',x:30,y:-40,engaged: false, connectedWith: 'F'},
            {part:'frontHardpoint',x:-50,y:85,engaged: false, connectedWith: 'G'},
        ], 
    },
    middle_hull:{
        name:'middle_hull',subNodes: [
            {part:'front_hull',x:(FHW+MHW)/2,y:0,engaged: false, flipped:true, connectedWith: 'A'},
            {part:'front_hull',x:-(FHW+MHW)/2,y:0,engaged: false, connectedWith: 'B'},
            {part:'middle_hull',x:MHW,y:0,engaged: false, connectedWith: 'A'},
            {part:'middle_hull',x:-MHW,y:0,engaged: false, connectedWith: 'B'},
            {part:'back_hull',x:(BHW+MHW)/2,y:0,engaged: false, connectedWith: 'A'},
            {part:'back_hull',x:-(BHW+MHW)/2,y:0,engaged: false, flipped:true, connectedWith: 'B'},
            {part:'flipper',x:-80,y:70,engaged: false, connectedWith: 'C'},
            {part:'flipper',x:80,y:70,engaged: false, connectedWith: 'C'},
            {part:'top_hatch',x:-80,y:-155,engaged: false, connectedWith: 'D'},
            {part:'top_plate',x:-80,y:-80,engaged: false, connectedWith: 'D'},
            {part:'gun_assembly',x:-80,y:-135,engaged: false, connectedWith: 'D'},
            {part:'top_hatch',x:80,y:-155,engaged: false, connectedWith: 'E'},
            {part:'top_plate',x:80,y:-80,engaged: false, connectedWith: 'E'},
            {part:'gun_assembly',x:80,y:-135,engaged: false, connectedWith: 'E'},
            {part:'window',x:0,y:0,engaged: false, connectedWith: 'F'},
            {part:'flair1',x:0,y:-40,engaged: false, connectedWith: 'F'},
            {part:'flair2',x:0,y:-40,engaged: false, connectedWith: 'F'},
            {part:'gun_assembly',x:0,y:135,engaged: false, connectedWith: 'H', rotated:180},
        ], 
    },
    back_hull:{
        name:'back_hull',subNodes: [
            {part:'back_armor',x:-120,y:110,engaged: false, connectedWith: 'G'},
            {part:'top_plate',x:-120,y:-80,engaged: false, connectedWith: 'E'},
            {part:'gun_assembly',x:-120,y:-135,engaged: false, connectedWith: 'E'},
            {part:'middle_hull',x:-(MHW+BHW)/2,y:0,engaged: false, connectedWith: 'B'},
            {part:'window',x:-50,y:0,engaged: false, connectedWith: 'F'},
            {part:'flair1',x:-50,y:-40,engaged: false, connectedWith: 'F'},
            {part:'flair2',x:-50,y:-40,engaged: false, connectedWith: 'F'},
            {part:'propeller',x:200,y:-20,engaged: false, connectedWith: 'D'},
            {part:'gun_assembly',x:-20,y:100,engaged: false, connectedWith: 'H', rotated:158},
        ], 
    },
    window:{
        name:'window',subNodes: [], 
    },
    propeller:{
        name:'propeller',subNodes: [], 
    },
    flipper:{
        name:'flipper',subNodes: [], 
    },
    top_hatch:{
        name:'top_hatch',subNodes: [], 
    },
    top_plate:{
        name:'top_plate',subNodes: [], 
    },
    gun_assembly:{
        name:'gun_assembly',subNodes: [], 
    },
    back_armor:{
        name:'back_armor',subNodes: [], 
    },
    frontHardpoint:{
        name:'frontHardpoint',subNodes: [
            {part:'miningLaser',x:-60,y:40,engaged: false, connectedWith: 'K'},
        ], 
    },
    flair1:{
        name:'flair1',subNodes: [], 
    },
    flair2:{
        name:'flair2',subNodes: [], 
    },
    miningLaser:{
        name:'miningLaser',subNodes: [], 
    },
}

nodeStructure = JSON.stringify(nodeStructure);

function preload()
{  
    this.load.bitmapFont('MKOCR', 'assets/MKOCR.png', 'assets/MKOCR.xml');
    this.load.bitmapFont('QuirkyRobot', 'assets/QuirkyRobot.png', 'assets/QuirkyRobot.xml');
    this.load.plugin('rexglowfilter2pipelineplugin', 'src/rexglowfilter2pipelineplugin.min.js', true);
    this.load.plugin('rexkawaseblurpipelineplugin', 'src/rexkawaseblurpipelineplugin.min.js', true);      
    this.load.plugin('rexhorrifipipelineplugin', 'src/rexhorrifipipelineplugin.min.js', true);      
    this.load.plugin('rextoonifypipelineplugin', 'src/rextoonifypipelineplugin.min.js', true);   
    this.load.multiatlas('interface', 'assets/interface.json', 'assets');
    this.load.multiatlas('submarine', 'assets/submarineCentreAnchors.json', 'assets');
}

function create ()
{
    scene = this;
    scene.input.topOnly = false;
    var workshopInterface = this.add.container(workshopInterfaceX,workshopInterfaceY);

    var workshopInterfaceBackground = this.add.image(0,0,'interface','workshopInterface.png');
    var loadButtonUp = this.add.image(-28,133,'interface','loadButtonUp.png').setInteractive();
    var loadButtonOver = this.add.image(-28,133,'interface','loadButtonOver.png').setInteractive();
    var saveButtonUp = this.add.image(37.4,133,'interface','saveButtonUp.png').setInteractive();
    var saveButtonOver = this.add.image(37.4,133,'interface','saveButtonOver.png').setInteractive();
    var launchButtonUp = this.add.image(125,133,'interface','launchButtonUp.png').setInteractive();
    var launchButtonOver = this.add.image(125,133,'interface','launchButtonOver.png').setInteractive();

    workshopInterface.add(workshopInterfaceBackground);
    workshopInterface.add(loadButtonUp);
    workshopInterface.add(loadButtonOver);
    loadButtonOver.setVisible(false);
    workshopInterface.add(saveButtonUp);
    workshopInterface.add(saveButtonOver);
    saveButtonOver.setVisible(false);
    workshopInterface.add(launchButtonUp);
    workshopInterface.add(launchButtonOver);
    launchButtonOver.setVisible(false);

    loadButtonUp.on('pointerover', () => {
        loadButtonUp.setVisible(false);
        loadButtonOver.setVisible(true);
        document.body.style.cursor = 'pointer';
    });
    loadButtonOver.on('pointerout', () => {
        loadButtonUp.setVisible(true);
        loadButtonOver.setVisible(false);
        document.body.style.cursor = 'default';
    });
    loadButtonOver.on('pointerdown', () => {
        loadButtonUp.setVisible(true);
        loadButtonOver.setVisible(false);
        const savedSubJSON = localStorage.getItem('savedSub');
        trashSub();
        const loadedSub = JSON.parse(savedSubJSON);
        if(Object.keys(loadedSub).length !== 0){
            loadSub(loadedSub, rootNode);
        }
    });

    saveButtonUp.on('pointerover', () => {
        saveButtonUp.setVisible(false);
        saveButtonOver.setVisible(true);
        document.body.style.cursor = 'pointer';
    });
    saveButtonOver.on('pointerout', () => {
        saveButtonUp.setVisible(true);
        saveButtonOver.setVisible(false);
        document.body.style.cursor = 'default';
    });
    saveButtonOver.on('pointerdown', () => {
        saveButtonUp.setVisible(true);
        saveButtonOver.setVisible(false);
        const savedSubJSON = JSON.stringify(saveSub(rootNode.list[0]));
        localStorage.setItem('savedSub',savedSubJSON);
    });

    launchButtonUp.on('pointerover', () => {
        launchButtonUp.setVisible(false);
        launchButtonOver.setVisible(true);
        document.body.style.cursor = 'pointer';
    });
    launchButtonOver.on('pointerout', () => {
        launchButtonUp.setVisible(true);
        launchButtonOver.setVisible(false);
        document.body.style.cursor = 'default';
    });
    launchButtonOver.on('pointerdown', () => {
        launchButtonUp.setVisible(true);
        launchButtonOver.setVisible(false);
    });

    //Shop Interface Stuff
    shopInterface = this.add.container(0,0);
    var lowerScreen = this.add.image(-23,53.1,'interface','lowerScreen.png').setInteractive();
    lowerScreen.alpha = 0.1;
    shopInterface.add(lowerScreen);

    this.input.on('pointerup', function (pointer){
        pointerState = 'up';
    });
    this.input.on('pointermove', function (pointer) {
        pointerX = pointer.x;
        pointerY = pointer.y;
    });
    lowerScreen.on('pointerout', () =>{
        document.body.style.cursor = 'default';
        pointerOnShop = false;
    });
    lowerScreen.on('pointerover', () => {
        document.body.style.cursor = 'grab';
        pointerOnShop = true;
    });
    lowerScreen.on('pointerdown', () => {
        pointerState = 'down'
    });

    allSubParts = ['front_hull','middle_hull','back_hull','flipper','propeller','top_hatch','top_plate','back_armor','frontHardpoint','window','flair1','flair2','miningLaser'];
    partCosts =   [ 200,         200,          200,        20,       50,        50,         100,        150,         60,               10,      10,      10,      60          ];

    for(var parts of allSubParts){
        createPart(parts, true);
    }
    createPart([['gun_turret','gun_base'],true,'gun_assembly']);

    //Add all the parts to the screen interface
    for(var i=0;i<partsList.length;i++){
        addPartToShopInterface(partsList[i]);
        partsList[i].x = sumOfPreviousPartsWidth(i, partsList, 50)-220;
        partsList[i].y = 53.1;
        partsList[i].originalX = partsList[i].x;
    }
    totalPartsListWidth = sumOfPreviousPartsWidth(partsList.length, partsList, 50);

    //Building Sub Screen
    buildInterface = this.add.container();
    var upperScreen = this.add.image(-22.75,-102.5,'interface','upperScreen.png').setInteractive();
    upperScreen.alpha = 0.01;
    buildInterface.add(upperScreen);
    createRootNode();
    buildTargetX = workshopInterfaceX+rootNode.x;
    buildTargetY = workshopInterfaceY+rootNode.y;

    upperScreen.on('pointerover', () => {
        if(allPingGraphics.length > 0){return};
        mouseOverBuildScreen = true;
        scene.input.topOnly = true;
    });
    upperScreen.on('pointerout', () => {
        mouseOverBuildScreen = false;
        scene.input.topOnly = false;
    });
    upperScreen.on('pointerdown', () => {
        if(mouseOverPart.length == 0){
            partSelected = null;
            destroySelectRect();
            updateBuildScreenText();
        }
    });

    //Trash button
    var binIcon = this.add.image(200,-164,'interface','binIcon.png').setInteractive();
    binIcon.alpha = 0.8;
    buildInterface.add(binIcon);
    binIcon.on('pointerover', () => {
        binIcon.alpha = 1;
        document.body.style.cursor = 'pointer';
        mouseOverBinIcon = true;
    });
    binIcon.on('pointerout', () => {
        binIcon.alpha = 0.8;
        document.body.style.cursor = 'default';
        mouseOverBinIcon = false;
    });
    binIcon.on('pointerdown', () => {
        if(partSelected == null){
            trashSub();
        } else {
            //reenable connections to parent parent
            for(var subNodes of partSelected.parentContainer.parentContainer.subNodes){
                if(subNodes.connectedWith === partSelected.parentContainer.connectedVia){
                    subNodes.engaged = false;
                }
            }
            //destroy and refund children
            var allDestroyedPartChildren = getAbsolutelyAll(partSelected.parentContainer);            
            for(var removedPart of allDestroyedPartChildren){
                if(removedPart.name === "middle_hull"){
                    middleHullsPlaced --;
                }
                if(removedPart.name === "top_hatch"){
                    hatchPlaced = false;
                }
                if (allParts.includes(removedPart)) {
                    allParts.splice(allParts.indexOf(removedPart), 1);
                    credits += getPartPrice(removedPart.name);
                }
            }
            //destroy and refund part
            if(partSelected.parentContainer.name !== "rootNode"){
                const index = allParts.indexOf(partSelected.parentContainer);
                if(index > -1){
                    allParts.splice(index,1);
                }
            }
            credits += getPartPrice(partSelected.parentContainer.name);

            //Rules stuff
            if(partSelected.parentContainer.name === "top_hatch"){
                hatchPlaced = false;
            }
            if(partSelected.parentContainer.name === "middle_hull"){
                middleHullsPlaced --;
            }

            //This kills the part
            partSelected.parentContainer.destroy();
        }
        partSelected = null;
        destroySelectRect();
        updateBuildScreenText();
    });

    //Build screen text
    buildScreenText = this.add.bitmapText(-252,-175,'MKOCR', '',14);
    updateBuildScreenText();
    buildScreenText.setTint(0x98FFBA);
    workshopInterface.add(buildScreenText);
    
    //global positioned because that's how masks do
    var lowerScreenMask = this.add.image(workshopInterfaceX-23.75, workshopInterfaceY+53,'interface','lowerScreen.png');
    workshopInterface.add(lowerScreenMask)
    lowerScreenMask.setVisible(false);
    shopInterface.mask = new Phaser.Display.Masks.BitmapMask(this, lowerScreenMask);
    workshopInterface.add(shopInterface);

    var upperScreenMask = this.add.image(workshopInterfaceX-22.75, workshopInterfaceY-102.5,'interface','upperScreen.png').setInteractive();
    workshopInterface.add(upperScreenMask)
    upperScreenMask.setVisible(false);

    buildInterface.mask = new Phaser.Display.Masks.BitmapMask(this, upperScreenMask);
    workshopInterface.add(buildInterface);
 
    //Parts text above the shop interface
    var partsPlate = this.add.image(-216,-4,'interface','partsPlate.png');
    workshopInterface.add(partsPlate);

    //Effects
    var postFxPlugin = this.plugins.get('rexhorrifipipelineplugin');
    var postFxPluginToon = this.plugins.get('rextoonifypipelineplugin');
    var postFxPluginBlur = scene.plugins.get('rexkawaseblurpipelineplugin');
    var postFxPluginGlow = this.plugins.get('rexglowfilter2pipelineplugin');

    var postFxPipelineToonLower = postFxPluginToon.add(shopInterface, {
        edgeThreshold: 0.20,
        hueLevels: 13,
        satLevels: 10,
        valLevels: 10,
        edgeColor: 0x98FFBA,
    });

    var postFxPipelineToonUpper = postFxPluginToon.add(buildInterface, {
        edgeThreshold: 0.20,
        hueLevels: 13,
        satLevels: 10,
        valLevels: 10,
        edgeColor: 0x98FFBA,
    });

    //var postFxPipeline = postFxPluginBlur.add(shopInterface, {blur: 0, quality: 1, pixelWidth:0.7, pixelHeight:0.7,});
    //var postFxPipeline = postFxPluginBlur.add(buildInterface, {blur: 0, quality: 1, pixelWidth:0.7, pixelHeight:0.7,});
    var postFxPipeline = postFxPluginGlow.add(shopInterface, { distance: 4, outerStrength: 1.25,  innerStrength: 0, glowColor: 0x98FFBA});
    var postFxPipeline = postFxPluginGlow.add(buildInterface, { distance: 4, outerStrength: 1.25,  innerStrength: 0, glowColor: 0x98FFBA,});

    var horrifiSettings = {
        enable: true,
        // Bloom
        bloomRadius: 0.2,
        bloomIntensity: 1.2,
        bloomThreshold: 0.05,
        bloomTexelWidth: 0.05,
        bloomTexelHeight: 0.05,
        bloomEnable: false,
        // Chromatic abberation
        chabIntensity: 0,
        // Vignette
        vignetteStrength: 0.1,
        vignetteIntensity: 0.1,
        vignetteEnable: false,
        // Noise
        noiseEnable: false,
        noiseStrength: 0.2,
        // VHS
        vhsStrength: 0,
        // Scanlines
        scanStrength: 0.1,
        //CRT
        crtWidth: 5,
        crtHeight: 5,
    }
    var horrifiSettings2 = {
        enable: true,
        // Bloom
        bloomRadius: 0.08,
        bloomIntensity: 1,
        bloomThreshold: 0.03,
        bloomTexelWidth: 0.05,
        bloomTexelHeight: 0.05,
        bloomEnable: false,
        // Chromatic abberation
        chabIntensity: 0,
        // Vignette
        vignetteStrength: 0.1,
        vignetteIntensity: 0.1,
        vignetteEnable: false,
        // Noise
        noiseEnable: false,
        noiseStrength: 0.2,
        // VHS
        vhsStrength: 0,
        // Scanlines
        scanStrength: 0.1,
        //CRT
        crtWidth: 5,
        crtHeight: 5,
    }

    //var postFxPipelineLower = postFxPlugin.add(shopInterface, horrifiSettings);
    //var postFxPipelineUpper = postFxPlugin.add(buildInterface, horrifiSettings2); 

}

function getAbsolutelyAll(container) {
    let objects = [];
    container.getAll().forEach(function(object) {
        if(object.type === "Container"){
            objects.push(object);
            if (object.list.length > 0) {
                objects = objects.concat(getAbsolutelyAll(object));
            }
        }
    });
    return objects;
}

function saveSub(obj) {
    var subCopy = {};
    for (var key in obj) {
      if ((key === "x" || key === "y" || key === "list" || key === "name" || key === "flipped" || key === "rotated" || key === "connectedVia")) {
        if (typeof obj[key] === "object") {
          if (Array.isArray(obj[key])) {
            subCopy[key] = obj[key].filter(object => object.type === "Container" && object.name !== "").map(item => saveSub(item));
          }
        } else {
          subCopy[key] = obj[key];
        }
      }
    }
    return subCopy;
}

function loadSub(obj,parentPart) {
    let newPartType = buildRules(obj.name);
    const currentPart = addPartToBuildInterface(createPart(newPartType), obj.x, obj.y,parentPart,newPartType,obj.flipped, {connectedWith: obj.connectedVia}, obj.rotated);
    for(var nodes of parentPart.subNodes){
        if(nodes.connectedWith == currentPart.connectedVia){
            nodes.engaged = true;
        }
    }
    for (var key in obj) {
        if (typeof obj[key] === "object") {
          if (Array.isArray(obj[key])) {
            obj[key].map(item => loadSub(item,currentPart));
          }
        }
    }
}

function createPart(partName, addingToShop){
    if(partName === 'skip'){
        return;
    }
    if(typeof partName === 'string'){
        var part = scene.add.image(0,0,'submarine',partName+'.png').setInteractive(); 
        part.partType = partName;
        if(addingToShop == true){
            partsList.push(part);
        }
        return part;
    } else {
        var assembly = scene.add.container(0,0);
        for(let parts of partName[0]){
            let part = scene.add.image(0,0,'submarine',parts+'.png');
            assembly.add(part);
        }
        assembly.setSize(assembly.getBounds().width,assembly.getBounds().height); //Why isn't this just done automatically Phaser?
        assembly.setInteractive();
        assembly.partType = partName[2];
        if(partName[1] == true){
            partsList.push(assembly);
        }
        return assembly;
    }
}

function sumOfPreviousPartsWidth(i,parts, margin){
    var totalWidth = 0;
    for(var j=0;j<i;j++){
        totalWidth += (parts[j].width/6)+margin;
    }
    return totalWidth;
}

function addPartToShopInterface(part){
    part.scale = 0.3;
    part.originalHeight = part.getBounds().height/500;
    part.tarScale = .4-part.originalHeight;
    
    shopInterface.add(part);

    //Can't set tint on a container so had to do this
    setTintPart(part,0x3B9459);

    part.on('pointerover', () => {
        if(!pointerOnShop){return;}
        setTintPart(part,0x57FF77);
        part.tarScale = .5-part.originalHeight;
        document.body.style.cursor = 'pointer'; 
    });
    part.on('pointerout', () => {
        if(!pointerOnShop){return;}
        setTintPart(part,0x3B9459);
        part.tarScale = .4-part.originalHeight;
        document.body.style.cursor = 'grab';
    });
    part.on('pointerdown', () => {
        if(!pointerOnShop){return;}
        addPartToBuild(part.partType);
        document.body.style.cursor = 'pointer';
    });
    part.on('pointerup', () => {
        if(!pointerOnShop){return;}
        document.body.style.cursor = 'pointer';
    });
}
function updateBuildScreenText(){
    if(partSelected == null){
        buildScreenText.text = '> Credits: ' + credits.toLocaleString() + '\n> Class: A';
    } else {
        buildScreenText.text = '> Credits: ' + credits.toLocaleString() + '\n> Class: A\n> ' + partSelected.partType;
    }
    if(credits > 0){
        buildScreenText.setTint(0x98FFBA);
    } else {   
        buildScreenText.setTint(0xFF6F6F);
    }
}

function setTintPart(part,color){
    if(part.type != 'Container'){
        part.setTint(color);
    } else {
        for(var components of part.list){
            components.setTint(color);
        }
    }
}

function createRootNode(){
    rootNode = scene.add.container();
    var newStructure = JSON.parse(nodeStructure);
    rootNode = Object.assign(rootNode, newStructure.rootNode);
    rootNode.scale = 0.3;
    allParts.push(rootNode);
    buildInterface.add(rootNode);
}

function trashSub(){
    for(var parts of allParts){
        credits += getPartPrice(parts.name);
        parts.destroy();
    }
    updateBuildScreenText();
    allParts = [];
    removePings();
    createRootNode();
    hatchPlaced = false;
    middleHullsPlaced = 0;
}

function addPartToBuildInterface(part,x,y,parentPart,partType,flipped,originNode,rotated){
    if(partType === 'skip'){
        return;
    }
    var partContainer = scene.add.container();
    if(rotated != undefined){
        partContainer.angle = rotated;
        partContainer.rotated = rotated;        
    }
    partContainer.alpha = 0;
    partContainer.x = x;
    partContainer.y = y;
    if(flipped == true){
        partContainer.flipped = flipped;
        partContainer.scaleX = -1;
    }
    var newStructure = JSON.parse(nodeStructure);
    if(Array.isArray(partType)){
        partType = partType[2];
    }
    partContainer = Object.assign(partContainer, newStructure[partType]);
    
    //Preventing reverse connections
    if(partType == 'middle_hull'){
        middleHullsPlaced ++;
        if(originNode.connectedWith == 'A'){
            partContainer.subNodes = partContainer.subNodes.filter(function(obj){
                return obj.connectedWith !== 'B';
            });
        }
        if(originNode.connectedWith == 'B'){
            partContainer.subNodes = partContainer.subNodes.filter(function(obj){
                return obj.connectedWith !== 'A';
            });
        }
    }
    if(partType == 'back_hull' || partType == 'front_hull'){
        if(originNode.connectedWith == 'A' || originNode.connectedWith == 'B'){
            partContainer.subNodes = partContainer.subNodes.filter(function(obj){
                return obj.connectedWith !== 'B' && obj.connectedWith !== 'A';
            });
        }
    }
    
    partContainer.connectedVia = originNode.connectedWith;
    //Only one hatch
    if(partType == 'top_hatch'){
        hatchPlaced = true;
    }
    setTintPart(part,0x3B9459);
    if(partType == 'flair1' || partType == 'flair2'){
        setTintPart(part,0x3BFF59);
    }

    part.setInteractive();
    part.on('pointerover', () => {
        if(allPingGraphics.length > 0){return};
        mouseOverPart.push(part);
    });
    part.on('pointerout', () => {
        const index = mouseOverPart.indexOf(part);
        if(index > -1){
            mouseOverPart.splice(index,1);
        }
        setTintPart(part,0x3B9459);
        if(part.partType == 'flair1' || part.partType == 'flair2'){
            setTintPart(part,0x3BFF59);
        }
    });
    part.on('pointerdown', () => {
        if(allPingGraphics.length > 0){return};
        partSelected = part;
        updateBuildScreenText();
        destroySelectRect();
        drawSelectRect(part);
    });
    
    credits -= getPartPrice(partType);
    updateBuildScreenText();
    partContainer.add(part);
    parentPart.add(partContainer);
    allParts.push(partContainer);
    return partContainer;
}

var mouseOverPart = [];
var mouseOverBuildScreen = false;
var mouseOverBinIcon = false;

function getPartPrice(partType){
    for(var i =0;i<allSubParts.length;i++){
        if(allSubParts[i] === partType){
            return partCosts[i];
        }
    }
    if(partType === 'gun_assembly'){
        return 150;
    }
    return 0;
}

var hatchPlaced = false;
var middleHullsPlaced = 0;

function buildRules(partType){
    if(partType == 'gun_assembly'){
        return [['gun_turret','gun_base'],false,'gun_assembly'];
    }
    if(partType == 'top_hatch' && hatchPlaced){
        return 'skip';
    }
    if(partType == 'middle_hull' && middleHullsPlaced >= 2){
        return 'skip';
    }
    return partType;
}

function addPartToBuild(partType){
    destroySelectRect();
    //Search all parts for a place to put new part. Sometimes I call parts nodes... Sorry.
    var foundNodes = [];
    for(var parts of allParts){
        for(var subNodes of parts.subNodes){
            if(subNodes.part == partType && subNodes.engaged == false){
                let newPartType = buildRules(partType); //apply rules
                if(newPartType == 'skip'){return};
                foundNodes.push({PartType:newPartType,part:parts,x:subNodes.x, y:subNodes.y, subNodes:subNodes, connectionType:subNodes.connectedWith, flipped:subNodes.flipped, rotated:subNodes.rotated});
            }
        }
    }
    if(foundNodes.length == 1){
        var buildNode = foundNodes[0];
        buildNode.subNodes.engaged = true;
        for(var nodes of buildNode.part.subNodes){
            if(nodes.connectedWith == buildNode.connectionType){
                nodes.engaged = true;
            }
        }
        addPartToBuildInterface(createPart(buildNode.PartType), buildNode.x, buildNode.y,buildNode.part,buildNode.PartType,buildNode.flipped, buildNode.subNodes, buildNode.rotated);
    }
    removePings();
    if(foundNodes.length > 1){
        for(var nodes of foundNodes){
            var pingGraphic2 = pingGraphic(nodes.x,nodes.y,nodes);
            nodes.part.add(pingGraphic2);
            allPingGraphics.push(pingGraphic2);
        }
    }
}
function removePings(){
    for(var pings of allPingGraphics){
        pings.destroy();
    }
    allPingGraphics = [];
}

function pingGraphic(x,y,buildNode){
    var pingGraphic = scene.add.circle(x,y,10, 0xFF0000);
    pingGraphic.setStrokeStyle(2,0xFF0000);
    pingGraphic.setInteractive();
    pingGraphic.on('pointerover', () => {
        pingGraphic.scale = 2;
        document.body.style.cursor = 'pointer'; 
    });
    pingGraphic.on('pointerout', () => {
        pingGraphic.scale = 1;
        document.body.style.cursor = 'default';
    });

    pingGraphic.on('pointerdown', () => {
        document.body.style.cursor = 'default';
        buildNode.subNodes.engaged = true;
        for(var nodes of buildNode.part.subNodes){
            if(nodes.connectedWith == buildNode.connectionType){
                nodes.engaged = true;
            }
        }
        mouseOverBuildScreen = true;
        scene.input.topOnly = true;
        addPartToBuildInterface(createPart(buildNode.PartType), buildNode.x, buildNode.y,buildNode.part,buildNode.PartType,buildNode.flipped, buildNode.subNodes, buildNode.rotated);
        removePings();
    });

    return pingGraphic;
}

var shopScrollTar = 0;
var prevPointerX = 0;
var pointerDelta = 0;
var pointerState;
var pointerX;
var pointerY;
var buildTargetX;
var buildTargetY;
var scaleTar = 0.2;

var rectGraphics = [];

function drawSelectRect(target){
    const graphicWidth = target.getBounds().width/2+8;
    const graphicHeight = target.getBounds().height/2+8;
    const segmentLength = 10;
    var selectRect = scene.add.container();
    var graphics = scene.add.graphics();
    graphics.lineStyle(2,0x98FFBA);
    var line1 = graphics.lineBetween(-graphicWidth,-graphicHeight,-graphicWidth+segmentLength,-graphicHeight);
    selectRect.add(line1);
    selectRect.add(graphics.lineBetween(-graphicWidth,-graphicHeight,-graphicWidth,-graphicHeight+segmentLength));
    selectRect.add(graphics.lineBetween(graphicWidth,-graphicHeight,graphicWidth-segmentLength,-graphicHeight));
    selectRect.add(graphics.lineBetween(graphicWidth,-graphicHeight,graphicWidth,-graphicHeight+segmentLength));
    selectRect.add(graphics.lineBetween(graphicWidth,graphicHeight,graphicWidth-segmentLength,graphicHeight));
    selectRect.add(graphics.lineBetween(graphicWidth,graphicHeight,graphicWidth,graphicHeight-segmentLength));
    selectRect.add(graphics.lineBetween(-graphicWidth,graphicHeight,-graphicWidth,graphicHeight-segmentLength));
    selectRect.add(graphics.lineBetween(-graphicWidth,graphicHeight,-graphicWidth+segmentLength,graphicHeight));
    selectRect.setSize(graphicWidth,graphicHeight);
    selectRect.x = target.getBounds().x+target.getBounds().width/2;
    selectRect.y = target.getBounds().y+target.getBounds().height/2;
    selectRect.target = target;
    rectGraphics.push(selectRect);
}

function destroySelectRect(){
    if(rectGraphics.length>0){
        rectGraphics[0].destroy();
        rectGraphics = [];
    }
}

function interfaceMovement(){
    rootNode.x -= (rootNode.getBounds().centerX - buildTargetX)/70
    rootNode.y -= (rootNode.getBounds().centerY - buildTargetY)/70
    for(var i=0;i<partsList.length;i++){
        partsList[i].x -= (partsList[i].x - (shopScrollTar+partsList[i].originalX))/28;
        partsList[i].scale -= (partsList[i].scale - partsList[i].tarScale)/12;
    }
    if(rootNode.getBounds().width > 1){
        var scale_X = ((rootNode.getBounds().width+rootNode.getBounds().height)/2/1000);
        rootNode.scaleX -= (scale_X - scaleTar)/20
    }
    if(rootNode.scaleX > .35){
        rootNode.scaleX = .35;
    }
    if(rootNode.scaleX < .2){
        rootNode.scaleX = .2;
    }
    rootNode.scaleY = rootNode.scaleX;
    for(var j=0;j<allParts.length;j++){
        allParts[j].alpha -= (allParts[j].alpha - 1)/30;
    }
    pointerDelta = pointerX - prevPointerX;
    if(pointerState == 'down'){
        if(Math.abs(pointerDelta < 10)){
            shopScrollTar += pointerDelta*6;
            if(shopScrollTar<-totalPartsListWidth+300){
                shopScrollTar = -totalPartsListWidth+300;
            }
            if(shopScrollTar>0){
                shopScrollTar = 0;
            }
        }
    }
    prevPointerX = pointerX;
    if(mouseOverBuildScreen && !mouseOverBinIcon){
        if(mouseOverPart.length > 0){
            document.body.style.cursor = 'pointer'; 
        } else {
            document.body.style.cursor = 'default'; 
        }
    }
    if(mouseOverPart.length > 0){
        setTintPart(mouseOverPart[0], 0x57FF77);
    }
    if(rectGraphics.length > 0){
        var selectRect = rectGraphics[0];
        selectRect.x = selectRect.target.getBounds().x+selectRect.target.getBounds().width/2;
        selectRect.y = selectRect.target.getBounds().y+selectRect.target.getBounds().height/2;
    }

}

function update ()
{
    interfaceMovement();
}

//Useful for debugging positions
// this.input.on('pointermove', function (pointer) {
//     itemToTrack.x = pointer.x;
//     itemToTrack.y = pointer.y;
// });