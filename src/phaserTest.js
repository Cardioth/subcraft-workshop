'use strict'

var config = {
    width: 1250,
    height: 850,
    type: Phaser.AUTO,
    scene: {
        preload:preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var scene;

var partsList = [];

var rootNode;
var shopInterface;
var buildInterface;
var pointerOnShop;
var workshopInterfaceX = 600;
var workshopInterfaceY = 400;
var totalPartsListWidth;

var allNodes = [];
var hatchPlaced = false;
var allPingGraphics = [];

//Hull widths
var BHW = 342;
var FHW = 170;
var MHW = 251;

var nodeStructure = {
    rootNode:{
        name:'rootNode', x: -22.75, y: -102.5, subNodes: [
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
    this.load.plugin('rexhorrifipipelineplugin', 'src/rexhorrifipipelineplugin.min.js', true);      
    this.load.plugin('rextoonifypipelineplugin', 'src/rextoonifypipelineplugin.min.js', true);   
    this.load.multiatlas('interface', 'assets/interface.json', 'assets');
    this.load.multiatlas('submarine', 'assets/submarineCentreAnchors.json', 'assets');
}

function create ()
{
    scene = this;
    this.input.topOnly = false;
    var workshopInterface = this.add.container(workshopInterfaceX,workshopInterfaceY);

    var workshopInterfaceBackground = this.add.image(0,0,'interface','workshopInterface.png');
    var saveButtonUp = this.add.image(62,134,'interface','saveButtonUp.png').setInteractive();
    var saveButtonOver = this.add.image(62,134,'interface','saveButtonOver.png').setInteractive();
    var launchButtonUp = this.add.image(132,134,'interface','launchButtonUp.png').setInteractive();
    var launchButtonOver = this.add.image(132,134,'interface','launchButtonOver.png').setInteractive();6

    workshopInterface.add(workshopInterfaceBackground);
    workshopInterface.add(saveButtonUp);
    workshopInterface.add(saveButtonOver);
    saveButtonOver.setVisible(false);
    workshopInterface.add(launchButtonUp);
    workshopInterface.add(launchButtonOver);
    launchButtonOver.setVisible(false);

    saveButtonUp.on('pointerover', function () {
        saveButtonUp.setVisible(false);
        saveButtonOver.setVisible(true);
        document.body.style.cursor = 'pointer';
    });

    saveButtonOver.on('pointerout', function () {
        saveButtonUp.setVisible(true);
        saveButtonOver.setVisible(false);
        document.body.style.cursor = 'default';
    });

    saveButtonOver.on('pointerdown', function () {
        saveButtonUp.setVisible(true);
        saveButtonOver.setVisible(false);
    });

    launchButtonUp.on('pointerover', function () {
        launchButtonUp.setVisible(false);
        launchButtonOver.setVisible(true);
        document.body.style.cursor = 'pointer';
    });

    launchButtonOver.on('pointerout', function () {
        launchButtonUp.setVisible(true);
        launchButtonOver.setVisible(false);
        document.body.style.cursor = 'default';
    });
    launchButtonOver.on('pointerdown', function () {
        launchButtonUp.setVisible(true);
        launchButtonOver.setVisible(false);
    });

    //Shop Interface Stuff
    shopInterface = this.add.container(0,0);
    var lowerScreen = this.add.image(-23,53.1,'interface','lowerScreen.png').setInteractive();
    lowerScreen.alpha = 0.1;
    shopInterface.add(lowerScreen);

    this.input.on('pointerup', function(pointer){
        pointerState = 'up';
    });
    this.input.on('pointermove', function (pointer) {
        pointerX = pointer.x;
        pointerY = pointer.y;
    });
    lowerScreen.on('pointerout', function(){
        document.body.style.cursor = 'default';
        pointerOnShop = false;
    });
    lowerScreen.on('pointerover', function () {
        document.body.style.cursor = 'grab';
        pointerOnShop = true;
    });
    lowerScreen.on('pointerdown', function () {
        pointerState = 'down'
    });

    var allParts = ['front_hull','middle_hull','back_hull','flipper','propeller','top_hatch','top_plate','back_armor','frontHardpoint','window','flair1','flair2','miningLaser'];
    for(var parts of allParts){
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

    //Create Root Node
    rootNode = this.add.container();
    var newStructure = JSON.parse(nodeStructure);
    rootNode = Object.assign(rootNode, newStructure.rootNode);
    rootNode.scale = 0.3;
    allNodes.push(rootNode);
    buildTargetX = workshopInterfaceX+rootNode.x;
    buildTargetY = workshopInterfaceY+rootNode.y;

    buildInterface = this.add.container();
    buildInterface.add(rootNode);

    var upperScreen = this.add.image(-22.75,-102.5,'interface','upperScreen.png').setInteractive();
    upperScreen.alpha = 0.01;
    buildInterface.add(upperScreen);
    
    //global positioned cause mask
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
 
    //Parts text above the shop
    var partsPlate = this.add.image(-216,-4,'interface','partsPlate.png');
    workshopInterface.add(partsPlate);

    //Effects
    var postFxPlugin = this.plugins.get('rexhorrifipipelineplugin');
    var postFxPluginToon = this.plugins.get('rextoonifypipelineplugin');

    var postFxPipelineToonLower = postFxPluginToon.add(shopInterface, {
        edgeThreshold: 0.25,
        hueLevels: 2,
        satLevels: 10,
        valLevels: 10,
        edgeColor: 0x98FFBA,
    });

    var postFxPipelineToonUpper = postFxPluginToon.add(buildInterface, {
        edgeThreshold: 0.25,
        hueLevels: 2,
        satLevels: 10,
        valLevels: 10,
        edgeColor: 0x98FFBA,
    });

    var horrifiSettings = {
            enable: true,
            // Bloom
            bloomRadius: 0.08,
            bloomIntensity: 1,
            bloomThreshold: 0.03,
            bloomTexelWidth: 0.05,
            bloomTexelHeight: 0.05,
            // Chromatic abberation
            chabIntensity: .1,
            // Vignette
            vignetteStrength: 0.1,
            vignetteIntensity: 0.1,
            vignetteEnable: false,
            // Noise
            noiseEnable: false,
            noiseStrength: 0.2,
            // VHS
            vhsStrength: 0.2,
            // Scanlines
            scanStrength: 0.3,
            //CRT
            crtWidth: 1.5,
            crtHeight: 1.5,
    }
    var horrifiSettings2 = {
        enable: true,
        // Bloom
        bloomRadius: 0.08,
        bloomIntensity: 1,
        bloomThreshold: 0.03,
        bloomTexelWidth: 0.05,
        bloomTexelHeight: 0.05,
        // Chromatic abberation
        chabIntensity: .1,
        // Vignette
        vignetteStrength: 0.1,
        vignetteIntensity: 0.1,
        vignetteEnable: false,
        // Noise
        noiseEnable: false,
        noiseStrength: 0.2,
        // VHS
        vhsStrength: 0.2,
        // Scanlines
        scanStrength: 0.3,
        //CRT
        crtWidth: 5,
        crtHeight: 5,
}
    var postFxPipelineLower = postFxPlugin.add(shopInterface, horrifiSettings);
    var postFxPipelineUpper = postFxPlugin.add(buildInterface, horrifiSettings2); 

}

function createPart(partName, addingToShop){
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

    part.on('pointerover', function () {
        if(!pointerOnShop){return;}
        setTintPart(part,0x57FF77);
        part.tarScale = .5-part.originalHeight;
        document.body.style.cursor = 'pointer'; 
    });
    part.on('pointerout', function () {
        if(!pointerOnShop){return;}
        setTintPart(part,0x3B9459);
        part.tarScale = .4-part.originalHeight;
        document.body.style.cursor = 'grab';
    });
    part.on('pointerdown', function () {
        if(!pointerOnShop){return;}
        addPartToBuild(part.partType);
        document.body.style.cursor = 'pointer';
    });
    part.on('pointerup', function () {
        if(!pointerOnShop){return;}
        document.body.style.cursor = 'pointer';
    });
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

function addPartToBuildInterface(part,x,y,node,partType,flipped,originNode,rotated){
    var partContainer = scene.add.container();
    if(rotated != undefined){
        partContainer.angle = rotated;
    }
    partContainer.alpha = 0;
    partContainer.x = x;
    partContainer.y = y;
    if(flipped == true){
        partContainer.scaleX = -1;
    }
    var newStructure = JSON.parse(nodeStructure);
    if(Array.isArray(partType)){
        partType = partType[2];
    }
    partContainer = Object.assign(partContainer, newStructure[partType]);
    
    //Preventing reverse connections
    if(partType == 'middle_hull'){
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
    //Only one hatch
    if(partType == 'top_hatch'){
        hatchPlaced = true;
    }
    setTintPart(part,0x3BAA59);
    if(partType == 'flair1' || partType == 'flair2'){
        setTintPart(part,0x3BFF59);
    }
    partContainer.add(part);
    node.add(partContainer);
    allNodes.push(partContainer);
}

function addPartToBuild(partType){
    //search buildNodes for a place to put it.
    var foundNodes = [];
    for(var nodes of allNodes){
        for(var subNodes of nodes.subNodes){
            if(subNodes.part == partType && subNodes.engaged == false){
                //There's some bandaids here, sorry
                if(partType == 'top_hatch' && hatchPlaced){return;}//quick and dirty preventing more than one hatch
                let  newPartType = partType; //I'm sorry
                if(partType == 'gun_assembly'){newPartType = [['gun_turret','gun_base'],false,'gun_assembly']}; //quick and dirty way of adding the turret           
                foundNodes.push({PartType:newPartType,node:nodes,x:subNodes.x, y:subNodes.y, subNodes:subNodes, connectionType:subNodes.connectedWith, flipped:subNodes.flipped, rotated:subNodes.rotated});
            }
        }
    }
    if(foundNodes.length == 1){
        var buildNode = foundNodes[0];
        buildNode.subNodes.engaged = true;
        for(var nodes of buildNode.node.subNodes){
            if(nodes.connectedWith == buildNode.connectionType){
                nodes.engaged = true;
            }
        }
        addPartToBuildInterface(createPart(buildNode.PartType), buildNode.x, buildNode.y,buildNode.node,buildNode.PartType,buildNode.flipped, buildNode.subNodes, buildNode.rotated);
    }
    removePings();
    if(foundNodes.length > 1){
        for(var nodes of foundNodes){
            var pingGraphic2 = pingGraphic(nodes.x,nodes.y,nodes);
            nodes.node.add(pingGraphic2);
            allPingGraphics.push(pingGraphic2)
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
    pingGraphic.on('pointerover', function () {
        pingGraphic.scale = 2;
        document.body.style.cursor = 'pointer'; 
    });
    pingGraphic.on('pointerout', function () {
        pingGraphic.scale = 1;
        document.body.style.cursor = 'default';
    });

    pingGraphic.on('pointerdown', function () {
        document.body.style.cursor = 'default';
        buildNode.subNodes.engaged = true;
        for(var nodes of buildNode.node.subNodes){
            if(nodes.connectedWith == buildNode.connectionType){
                nodes.engaged = true;
            }
        }
        addPartToBuildInterface(createPart(buildNode.PartType), buildNode.x, buildNode.y,buildNode.node,buildNode.PartType,buildNode.flipped, buildNode.subNodes, buildNode.rotated);
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

function update ()
{
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
    if(rootNode.scaleX > .4){
        rootNode.scaleX = .4
    }
    rootNode.scaleY = rootNode.scaleX;
    for(var j=0;j<allNodes.length;j++){
        allNodes[j].alpha -= (allNodes[j].alpha - 1)/30;
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
}