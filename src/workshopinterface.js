'use strict'

import {nodeStructure} from '/src/nodestructure.js';
import {allSubParts, partCosts} from '/src/subparts.js';

var config = {
    width: 1000,
    height: 700,
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

var rootNode;
var shopInterface;
var buildInterface;
var buildScreenText;
var pointerOnShop;
var workshopInterfaceX = config.width/2;
var workshopInterfaceY = config.height/2;
var totalPartsListWidth;

var mouseOverPart = [];
var mouseOverBuildScreen = false;
var mouseOverBinIcon = false;
var buildScreenFrozen = false;

var allParts = [];
var allPingGraphics = [];

function preload()
{  
    this.load.bitmapFont('MKOCR', 'assets/MKOCR.png', 'assets/MKOCR.xml');
    this.load.bitmapFont('QuirkyRobot', 'assets/QuirkyRobot.png', 'assets/QuirkyRobot.xml');
    this.load.plugin('rexglowfilter2pipelineplugin', 'src/shaders/rexglowfilter2pipelineplugin.min.js', true);
    this.load.plugin('rexkawaseblurpipelineplugin', 'src/shaders/rexkawaseblurpipelineplugin.min.js', true);      
    this.load.plugin('rexhorrifipipelineplugin', 'src/shaders/rexhorrifipipelineplugin.min.js', true);      
    this.load.plugin('rextoonifypipelineplugin', 'src/shaders/rextoonifypipelineplugin.min.js', true);   
    this.load.multiatlas('interface', 'assets/interface.json', 'assets');
    this.load.multiatlas('submarine', 'assets/submarine.json', 'assets'); //New JSON for the submarine, uses the same sub
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
        if(buildScreenFrozen){return};
        destroySelectRect();
        if(rootNode.list.length !== 0){
            buildScreenFrozen = true;
            dialogueBoxYesCancel(()=>{
                const savedSubJSON = localStorage.getItem('savedSub');
                buildScreenFrozen = false;
                trashSub();
                const loadedSub = JSON.parse(savedSubJSON);
                if(Object.keys(loadedSub).length !== 0){
                    loadSub(loadedSub, rootNode);
                }
                mouseOverPart = [];
            },workshopInterface,"Are you sure?");
        } else {
            const savedSubJSON = localStorage.getItem('savedSub');
            trashSub();
            const loadedSub = JSON.parse(savedSubJSON);
            if(Object.keys(loadedSub).length !== 0){
                loadSub(loadedSub, rootNode);
            }
            mouseOverPart = [];
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

    for(var parts of allSubParts){
        createPart(parts, true);
    }

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
        if(buildScreenFrozen){return};
        if(partSelected == null){
            if(rootNode.list.length === 0){return};
            buildScreenFrozen = true;
            dialogueBoxYesCancel(()=>{
                buildScreenFrozen = false;
                trashSub();
                destroySelectRect();
            },workshopInterface,"Are you sure you want to destroy the sub?");
        } else {
            trashPart();
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

    //Shader Effects
    var postFxPlugin = this.plugins.get('rexhorrifipipelineplugin');
    var postFxPluginToon = this.plugins.get('rextoonifypipelineplugin');
    var postFxPluginBlur = scene.plugins.get('rexkawaseblurpipelineplugin');
    var postFxPluginGlow = this.plugins.get('rexglowfilter2pipelineplugin');

    var postFxPipelineToonLower = postFxPluginToon.add(shopInterface, {
        edgeThreshold: 0.20,
        hueLevels: 2,
        satLevels: 10,
        valLevels: 10,
        edgeColor: 0x98FFBA,
    });

    var postFxPipelineToonUpper = postFxPluginToon.add(buildInterface, {
        edgeThreshold: 0.20,
        hueLevels: 2,
        satLevels: 10,
        valLevels: 10,
        edgeColor: 0x98FFBA,
    });

    var postFxPipeline = postFxPluginBlur.add(shopInterface, {blur: 0, quality: 1, pixelWidth:0.7, pixelHeight:0.7,});
    var postFxPipeline = postFxPluginBlur.add(buildInterface, {blur: 0, quality: 1, pixelWidth:0.7, pixelHeight:0.7,});
    var postFxPipeline = postFxPluginGlow.add(shopInterface, { distance: 4, outerStrength: 1.25,  innerStrength: 0, glowColor: 0x98FFBA});
    var postFxPipeline = postFxPluginGlow.add(buildInterface, { distance: 4, outerStrength: 1.25,  innerStrength: 0, glowColor: 0x98FFBA,});
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

function dialogueBoxYesCancel(yesFunc,addTo,text){
    let dialogueBoxContainer = scene.add.container();
    let dialogueBox = scene.add.rectangle(-20,-110,340,100, 0x010019);
    dialogueBox.setStrokeStyle(1,0x98FFBA);
    dialogueBoxContainer.add(dialogueBox);

    let dialogueText = scene.add.bitmapText(-20,-130,'MKOCR', text,14).setOrigin(0.5);
    dialogueText.setTint(0x98FFBA);
    dialogueBoxContainer.add(dialogueText);

    let yesButton = dialogueButton(()=>{
        yesFunc();
        dialogueBoxContainer.destroy();
    },"Yes", );

    let cancelButton = dialogueButton(()=>{
        dialogueBoxContainer.destroy();
        buildScreenFrozen = false;
    },"Cancel");

    yesButton.x = -70;
    cancelButton.x = 30;
    yesButton.y = -95;
    cancelButton.y = -95;

    dialogueBoxContainer.add(yesButton);
    dialogueBoxContainer.add(cancelButton);
    addTo.add(dialogueBoxContainer);
}

function dialogueButton(func,text){
    let buttonContainer = scene.add.container();
    var button = scene.add.rectangle(-10,0,text.length*12,20, 0x010019);
    button.setStrokeStyle(1,0x98FFBA);
    buttonContainer.add(button);
    let buttonText = scene.add.bitmapText(-10,0,'MKOCR', text,14).setOrigin(0.5);
    buttonText.setTint(0x98FFBA);
    buttonContainer.add(buttonText);
    button.setInteractive();

    button.on('pointerover', () => {
        document.body.style.cursor = 'pointer'; 
        button.setFillStyle(0x184D4D);
    });
    button.on('pointerout', () => {
        document.body.style.cursor = 'default';
        button.setFillStyle(0x010019);
    });
    button.on('pointerdown', () => {
        func();
    });

    return buttonContainer;
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
        var part = scene.add.image(0,0,'submarine',partName+'.png').setInteractive().setOrigin(0.5,0.5);; 
        part.partType = partName;
        if(addingToShop == true){
            partsList.push(part);
        }
        return part;
    } else {
        var assembly = scene.add.container(0,0);
        for(let parts of partName[0]){
            let part = scene.add.image(0,0,'submarine',parts+'.png').setOrigin(0.5,0.5);;
            if(parts == "gun_turret"){part.setOrigin(0.5,1)};
            assembly.add(part);
        }
        assembly.setSize(assembly.getBounds().width,assembly.getBounds().height);
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
    destroySelectRect();
    removePings();
    createRootNode();
    hatchPlaced = false;
    middleHullsPlaced = 0;
}

function trashPart(){
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
        if(allPingGraphics.length > 0 || buildScreenFrozen){return};
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
        if(allPingGraphics.length > 0 || buildScreenFrozen){return};
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
                if(newPartType == 'skip' || buildScreenFrozen){return};
                foundNodes.push({PartType:newPartType,part:parts,x:subNodes.x, y:subNodes.y, subNodes:subNodes, connectionType:subNodes.connectedWith, flipped:subNodes.flipped, rotated:subNodes.rotated});
            }
        }
    }
    //Place the part if only one option
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
    //Create pings if multiple options
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
    const gWidth = target.getBounds().width/2+8;
    const gHeight = target.getBounds().height/2+8;
    const sLength = 10;
    var selectRect = scene.add.container();
    var graphics = scene.add.graphics();
    graphics.lineStyle(2,0x98FFBA);
    var line1 = graphics.lineBetween(-gWidth,-gHeight,-gWidth+sLength,-gHeight);
    selectRect.add(line1);
    selectRect.add(graphics.lineBetween(-gWidth,-gHeight,-gWidth,-gHeight+sLength));
    selectRect.add(graphics.lineBetween(gWidth,-gHeight,gWidth-sLength,-gHeight));
    selectRect.add(graphics.lineBetween(gWidth,-gHeight,gWidth,-gHeight+sLength));
    selectRect.add(graphics.lineBetween(gWidth,gHeight,gWidth-sLength,gHeight));
    selectRect.add(graphics.lineBetween(gWidth,gHeight,gWidth,gHeight-sLength));
    selectRect.add(graphics.lineBetween(-gWidth,gHeight,-gWidth,gHeight-sLength));
    selectRect.add(graphics.lineBetween(-gWidth,gHeight,-gWidth+sLength,gHeight));
    selectRect.setSize(gWidth,gHeight);
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

function update (){
    interfaceMovement();
}

//Useful for debugging positions
// this.input.on('pointermove', function (pointer) {
//     itemToTrack.x = pointer.x;
//     itemToTrack.y = pointer.y;
// });