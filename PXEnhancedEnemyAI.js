/*:
 * @target MZ
 * @plugindesc Enhanced Enemy AI v4.1.1 - State-Aware Decision Making (Fixed)
 * @author Prince Xaine
 * @help
 * 
 * ============================================================================
 * Enhanced Enemy AI System v4.1.1
 * ============================================================================
 * 
 * This plugin creates intelligent enemies that analyze ALL battlefield 
 * conditions including equipment, traits, items, and class characteristics.
 * 
 * Version 4.1.1 Fixes:
 * • Fixed action execution loops preventing enemies from acting
 * • Fixed debug logging performance issues
 * • Added null checks to prevent crashes
 * • Fixed memory leaks from growing caches
 * • Removed dangerous eval() usage
 * • Fixed runtime difficulty mode changes
 * • Improved performance with better caching
 * 
 * ============================================================================
 * Core Features (v4.1 additions)
 * ============================================================================
 * 
 * • State-Aware Decision Making - Enemies now consider state removal conditions
 * • Strategic State Preservation - Avoids removing beneficial states prematurely
 * • Removal Chance Calculation - Considers % chance of state removal by damage
 * • Turn-Based State Strategy - Factors in remaining state duration
 * • Alternative Action Prioritization - Seeks non-damaging options when appropriate
 * 
 * Previous features from v4.0 remain intact:
 * • Complete Trait Analysis - All actor/enemy/class/equipment traits
 * • Equipment Detection - Analyzes all equipment properties before combat
 * • Item Quantity Tracking - Considers remaining item quantities
 * • Class-Based Strategy - Adapts to class strengths/weaknesses
 * • Ex/Sp Parameter Analysis - Full parameter consideration
 * • Comprehensive Effect Handling - All skill/item/state effects
 * 
 * ============================================================================
 * 
 * @param difficultyMode
 * @text Difficulty Mode
 * @desc AI difficulty setting
 * @type select
 * @option Story Mode
 * @value 0
 * @option Adaptive Mode
 * @value 1
 * @option Masochist Mode
 * @value 2
 * @default 1
 * 
 * @param adaptiveRange
 * @text Adaptive Difficulty Range
 * @desc Min and max difficulty multipliers for Adaptive mode (format: min,max)
 * @type string
 * @default 0.5,1.5
 * 
 * @param adaptiveSpeed
 * @text Adaptive Speed
 * @desc How quickly difficulty adjusts (0.01 - 0.1)
 * @type number
 * @decimals 2
 * @default 0.02
 * 
 * @param statePreservationWeight
 * @text State Preservation Weight
 * @desc How much the AI values preserving beneficial states (0.0 - 2.0)
 * @type number
 * @decimals 2
 * @default 1.5
 * 
 * @param persistentMemory
 * @text Persistent Memory
 * @desc Keep AI memory between battles (Masochist mode always true)
 * @type boolean
 * @default false
 * 
 * @param debugMode
 * @text Debug Mode
 * @desc Show AI decision-making process in console
 * @type boolean
 * @default false
 * 
 * @param survivalWeight
 * @text Survival Weight
 * @desc How much the AI prioritizes survival (0.0 - 1.0)
 * @type number
 * @decimals 2
 * @default 0.35
 * 
 * @param damageWeight
 * @text Damage Weight
 * @desc How much the AI prioritizes dealing damage (0.0 - 1.0)
 * @type number
 * @decimals 2
 * @default 0.30
 * 
 * @param supportWeight
 * @text Support Weight
 * @desc How much the AI prioritizes support actions (0.0 - 1.0)
 * @type number
 * @decimals 2
 * @default 0.20
 * 
 * @param tacticalWeight
 * @text Tactical Move Weight
 * @desc Weight for pure tactical moves (status, buffs) (0.0 - 1.0)
 * @type number
 * @decimals 2
 * @default 0.15
 * 
 * @param statusEffectBonus
 * @text Status Effect Bonus Score
 * @desc Bonus score for applying status effects
 * @type number
 * @default 20
 * 
 * @param healingThreshold
 * @text Healing HP Threshold
 * @desc HP ratio below which healing is prioritized (0.0 - 1.0)
 * @type number
 * @decimals 2
 * @default 0.50
 * 
 * @param includeBasicAttack
 * @text Include Basic Attack
 * @desc Include basic attack in normal skill evaluation
 * @type boolean
 * @default false
 * 
 * @param learningRate
 * @text Learning Rate
 * @desc How quickly AI adapts to failures (0.0 - 1.0)
 * @type number
 * @decimals 2
 * @default 0.50
 * 
 * @param elementalBonus
 * @text Elemental Weakness Bonus
 * @desc Score multiplier for hitting elemental weaknesses
 * @type number
 * @decimals 1
 * @default 1.5
 * 
 * @param comboWindow
 * @text Combo Detection Window
 * @desc Number of turns to look for combo opportunities
 * @type number
 * @default 2
 * 
 * @param antiExploitThreshold
 * @text Anti-Exploit Threshold
 * @desc Turns of no progress before switching strategies
 * @type number
 * @default 3
 * 
 * @param itemTrackingEnabled
 * @text Item Tracking
 * @desc Track and respond to item usage
 * @type boolean
 * @default true
 * 
 * @param mistakeChance
 * @text Story Mode Mistake Chance
 * @desc Chance of suboptimal decisions in Story mode (0.0 - 1.0)
 * @type number
 * @decimals 2
 * @default 0.15
 * 
 * @param analyzeEquipment
 * @text Analyze Equipment
 * @desc Pre-analyze actor equipment for better decisions
 * @type boolean
 * @default true
 * 
 * @param considerItemQuantity
 * @text Consider Item Quantity
 * @desc Factor in remaining item quantities when targeting
 * @type boolean
 * @default true
 * 
 * @param statePreservationBonus
 * @text State Preservation Bonus
 * @desc Bonus score for preserving beneficial states on targets
 * @type number
 * @default 30
 * 
 * @param minStateValueThreshold
 * @text Minimum State Value Threshold
 * @desc Minimum turns remaining on state to consider preservation
 * @type number
 * @default 2
 * 
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 * 
 * @command changeDifficulty
 * @text Change Difficulty Mode
 * @desc Change the AI difficulty mode during gameplay
 * 
 * @arg difficultyMode
 * @text New Difficulty Mode
 * @desc Select the new difficulty mode
 * @type select
 * @option Story Mode
 * @value 0
 * @option Adaptive Mode
 * @value 1
 * @option Masochist Mode
 * @value 2
 * @default 1
 * 
 * @command setAdaptiveDifficulty
 * @text Set Adaptive Difficulty
 * @desc Manually set the current adaptive difficulty value
 * 
 * @arg value
 * @text Difficulty Value
 * @desc Current difficulty multiplier (0.5 - 1.5)
 * @type number
 * @decimals 2
 * @default 1.0
 * 
 * @command resetAIMemory
 * @text Reset AI Memory
 * @desc Clear all AI learning and memory data
 * 
 * @command toggleDebugMode
 * @text Toggle Debug Mode
 * @desc Toggle AI debug logging on/off
 */

(() => {
    'use strict';
    
    const pluginName = 'PXEnhancedEnemyAI';
    const parameters = PluginManager.parameters(pluginName);
    
    // Plugin parameters with runtime access
    const getPluginParams = () => {
        return {
            difficultyMode: $gameSystem._aiDifficultyMode !== undefined ? 
                $gameSystem._aiDifficultyMode : Number(parameters['difficultyMode']) || 1,
            adaptiveRange: (parameters['adaptiveRange'] || '0.5,1.5').split(',').map(Number),
            adaptiveSpeed: Number(parameters['adaptiveSpeed']) || 0.02,
            persistentMemory: parameters['persistentMemory'] === 'true',
            debugMode: $gameSystem._aiDebugMode !== undefined ? 
                $gameSystem._aiDebugMode : parameters['debugMode'] === 'true',
            survivalWeight: Number(parameters['survivalWeight']) || 0.35,
            damageWeight: Number(parameters['damageWeight']) || 0.30,
            supportWeight: Number(parameters['supportWeight']) || 0.20,
            tacticalWeight: Number(parameters['tacticalWeight']) || 0.15,
            statusEffectBonus: Number(parameters['statusEffectBonus']) || 20,
            healingThreshold: Number(parameters['healingThreshold']) || 0.50,
            includeBasicAttack: parameters['includeBasicAttack'] === 'true',
            learningRate: Number(parameters['learningRate']) || 0.50,
            elementalBonus: Number(parameters['elementalBonus']) || 1.5,
            comboWindow: Number(parameters['comboWindow']) || 2,
            antiExploitThreshold: Number(parameters['antiExploitThreshold']) || 3,
            itemTrackingEnabled: parameters['itemTrackingEnabled'] !== 'false',
            analyzeEquipment: parameters['analyzeEquipment'] !== 'false',
            considerItemQuantity: parameters['considerItemQuantity'] !== 'false',
            statePreservationBonus: Number(parameters['statePreservationBonus']) || 30,
            minStateValueThreshold: Number(parameters['minStateValueThreshold']) || 2,
            statePreservationWeight: Number(parameters['statePreservationWeight']) || 1.5,
            mistakeChance: Number(parameters['mistakeChance']) || 0.15
        };
    };
    
    // Initialize global memory
    window.$globalAIMemory = window.$globalAIMemory || {
        knownWeaknesses: {},
        knownResistances: {},
        knownEquipment: {},
        playerProfile: {
            healingUsage: {},
            itemUsage: {},
            skillUsage: {},
            turnPatterns: [],
            lastActions: [],
            itemQuantities: {}
        }
    };
    
    // Difficulty behaviors with runtime access
    const getDifficultyBehavior = (mode) => {
        const behaviors = {
            0: { // Story Mode
                multiplier: 0.6,
                randomness: 0.3,
                mistakeChance: getPluginParams().mistakeChance,
                memoryDepth: 3,
                learningRate: 0.1,
                perfectPrediction: false,
                sharedKnowledge: false,
                persistentMemory: false,
                predictiveCounter: false,
                adaptiveLearning: false
            },
            1: { // Adaptive Mode
                multiplier: function() {
                    const difficulty = $gameVariables.value(9999) || 1.0;
                    const range = getPluginParams().adaptiveRange;
                    return Math.max(range[0], Math.min(range[1], difficulty));
                },
                randomness: 0.1,
                mistakeChance: 0.05,
                memoryDepth: 10,
                learningRate: 0.3,
                perfectPrediction: false,
                sharedKnowledge: false,
                persistentMemory: getPluginParams().persistentMemory,
                predictiveCounter: true,
                adaptiveLearning: true
            },
            2: { // Masochist Mode
                multiplier: 1.5,
                randomness: 0,
                mistakeChance: 0,
                memoryDepth: 999,
                learningRate: 0.5,
                perfectPrediction: true,
                sharedKnowledge: true,
                persistentMemory: true,
                predictiveCounter: true,
                adaptiveLearning: true
            }
        };
        return behaviors[mode] || behaviors[1];
    };
    
    // Safe damage formula evaluator
    class SafeFormulaEvaluator {
        static evaluate(formula, a, b, v) {
            if (!formula || typeof formula !== 'string') return 100;
            
            try {
                // Create safe evaluation context
                const context = {
                    a: a || {},
                    b: b || {},
                    v: v || $gameVariables._data || {},
                    Math: Math
                };
                
                // Replace formula variables safely
                let safeFormula = formula;
                safeFormula = safeFormula.replace(/\ba\.(\w+)/g, (match, prop) => {
                    return context.a[prop] || 0;
                });
                safeFormula = safeFormula.replace(/\bb\.(\w+)/g, (match, prop) => {
                    return context.b[prop] || 0;
                });
                safeFormula = safeFormula.replace(/\bv\[(\d+)\]/g, (match, id) => {
                    return context.v[Number(id)] || 0;
                });
                
                // Use Function constructor for safer evaluation
                const func = new Function('Math', `return ${safeFormula}`);
                const result = func(Math);
                
                return isNaN(result) ? 100 : result;
            } catch (e) {
                if (getPluginParams().debugMode) {
                    console.error('Formula evaluation error:', e, 'Formula:', formula);
                }
                return 100; // Fallback damage
            }
        }
    }
    
    // Enhanced Trait Analyzer
    class TraitAnalyzer {
        static analyzeBattler(battler) {
            if (!battler) return this.getDefaultAnalysis();
            
            const analysis = this.getDefaultAnalysis();
            
            // Get all traits from all sources
            const traits = this.getAllTraits(battler);
            
            // Process each trait
            for (const trait of traits) {
                this.processTrait(trait, analysis);
            }
            
            // Calculate final parameters
            this.calculateFinalParams(battler, analysis);
            
            return analysis;
        }
        
        static getDefaultAnalysis() {
            return {
                params: {},
                exParams: {},
                spParams: {},
                elementRates: {},
                debuffRates: {},
                stateRates: {},
                stateResists: [],
                attackElements: [],
                attackStates: [],
                attackSpeed: 0,
                attackTimes: 0,
                actionTimes: 0,
                specialFlags: [],
                partyAbilities: [],
                sealedSkillTypes: [],
                sealedSkills: [],
                addedSkillTypes: [],
                addedSkills: [],
                weaponTypes: [],
                armorTypes: [],
                fixedEquips: [],
                sealedEquips: [],
                slotTypes: []
            };
        }
        
        static getAllTraits(battler) {
            let traits = [];
            
            // Base traits
            if (battler && battler.traits) {
                traits = traits.concat(battler.traits());
            }
            
            // Actor-specific traits
            if (battler && battler.isActor && battler.isActor()) {
                // Actor data traits
                if (battler.actor && battler.actor().traits) {
                    traits = traits.concat(battler.actor().traits);
                }
                
                // Class traits
                if (battler.currentClass && battler.currentClass() && battler.currentClass().traits) {
                    traits = traits.concat(battler.currentClass().traits);
                }
                
                // Equipment traits
                if (battler.equips) {
                    const equips = battler.equips();
                    for (const item of equips) {
                        if (item && item.traits) {
                            traits = traits.concat(item.traits);
                        }
                    }
                }
            } else if (battler && battler.isEnemy && battler.isEnemy()) {
                // Enemy traits
                if (battler.enemy && battler.enemy().traits) {
                    traits = traits.concat(battler.enemy().traits);
                }
            }
            
            // State traits
            if (battler && battler.states) {
                const states = battler.states();
                for (const state of states) {
                    if (state && state.traits) {
                        traits = traits.concat(state.traits);
                    }
                }
            }
            
            return traits;
        }
        
        static processTrait(trait, analysis) {
            if (!trait || !analysis) return;
            
            switch (trait.code) {
                case 11: // Element Rate
                    if (!analysis.elementRates[trait.dataId]) {
                        analysis.elementRates[trait.dataId] = 1.0;
                    }
                    analysis.elementRates[trait.dataId] *= trait.value;
                    break;
                    
                case 12: // Debuff Rate
                    if (!analysis.debuffRates[trait.dataId]) {
                        analysis.debuffRates[trait.dataId] = 1.0;
                    }
                    analysis.debuffRates[trait.dataId] *= trait.value;
                    break;
                    
                case 13: // State Rate
                    if (!analysis.stateRates[trait.dataId]) {
                        analysis.stateRates[trait.dataId] = 1.0;
                    }
                    analysis.stateRates[trait.dataId] *= trait.value;
                    break;
                    
                case 14: // State Resist
                    if (!analysis.stateResists.includes(trait.dataId)) {
                        analysis.stateResists.push(trait.dataId);
                    }
                    break;
                    
                case 21: // Param
                    const paramNames = ['mhp', 'mmp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'];
                    if (trait.dataId < paramNames.length) {
                        const paramName = paramNames[trait.dataId];
                        if (!analysis.params[paramName]) {
                            analysis.params[paramName] = 1.0;
                        }
                        analysis.params[paramName] *= trait.value;
                    }
                    break;
                    
                case 22: // Ex-Param
                    const exParamNames = ['hit', 'eva', 'cri', 'cev', 'mev', 'mrf', 'cnt', 'hrg', 'mrg', 'trg'];
                    if (trait.dataId < exParamNames.length) {
                        const exParamName = exParamNames[trait.dataId];
                        if (!analysis.exParams[exParamName]) {
                            analysis.exParams[exParamName] = 0;
                        }
                        analysis.exParams[exParamName] += trait.value;
                    }
                    break;
                    
                case 23: // Sp-Param
                    const spParamNames = ['tgr', 'grd', 'rec', 'pha', 'mcr', 'tcr', 'pdr', 'mdr', 'fdr', 'exr'];
                    if (trait.dataId < spParamNames.length) {
                        const spParamName = spParamNames[trait.dataId];
                        if (!analysis.spParams[spParamName]) {
                            analysis.spParams[spParamName] = 1.0;
                        }
                        analysis.spParams[spParamName] *= trait.value;
                    }
                    break;
                    
                case 31: // Attack Element
                    if (!analysis.attackElements.includes(trait.dataId)) {
                        analysis.attackElements.push(trait.dataId);
                    }
                    break;
                    
                case 32: // Attack State
                    analysis.attackStates.push({
                        stateId: trait.dataId,
                        rate: trait.value
                    });
                    break;
                    
                case 33: // Attack Speed
                    analysis.attackSpeed += trait.value;
                    break;
                    
                case 34: // Attack Times
                    analysis.attackTimes += trait.value;
                    break;
                    
                case 35: // Attack Skill
                    analysis.attackSkillId = trait.dataId;
                    break;
                    
                case 41: // Sealed Skill Type
                    if (!analysis.sealedSkillTypes.includes(trait.dataId)) {
                        analysis.sealedSkillTypes.push(trait.dataId);
                    }
                    break;
                    
                case 42: // Sealed Skill
                    if (!analysis.sealedSkills.includes(trait.dataId)) {
                        analysis.sealedSkills.push(trait.dataId);
                    }
                    break;
                    
                case 43: // Added Skill Type
                    if (!analysis.addedSkillTypes.includes(trait.dataId)) {
                        analysis.addedSkillTypes.push(trait.dataId);
                    }
                    break;
                    
                case 44: // Added Skill
                    if (!analysis.addedSkills.includes(trait.dataId)) {
                        analysis.addedSkills.push(trait.dataId);
                    }
                    break;
                    
                case 51: // Weapon Type
                    if (!analysis.weaponTypes.includes(trait.dataId)) {
                        analysis.weaponTypes.push(trait.dataId);
                    }
                    break;
                    
                case 52: // Armor Type
                    if (!analysis.armorTypes.includes(trait.dataId)) {
                        analysis.armorTypes.push(trait.dataId);
                    }
                    break;
                    
                case 53: // Fixed Equip
                    if (!analysis.fixedEquips.includes(trait.dataId)) {
                        analysis.fixedEquips.push(trait.dataId);
                    }
                    break;
                    
                case 54: // Sealed Equip
                    if (!analysis.sealedEquips.includes(trait.dataId)) {
                        analysis.sealedEquips.push(trait.dataId);
                    }
                    break;
                    
                case 55: // Slot Type
                    analysis.slotTypes.push({
                        type: trait.dataId === 0 ? 'normal' : 'dual',
                        value: trait.value
                    });
                    break;
                    
                case 61: // Action Times
                    analysis.actionTimes += trait.value;
                    break;
                    
                case 62: // Special Flag
                    const flagNames = ['auto-battle', 'guard', 'substitute', 'preserve-tp'];
                    if (trait.dataId < flagNames.length) {
                        analysis.specialFlags.push(flagNames[trait.dataId]);
                    }
                    break;
                    
                case 63: // Collapse Type
                    analysis.collapseType = trait.dataId;
                    break;
                    
                case 64: // Party Ability
                    const abilityNames = ['encounter-half', 'encounter-none', 'cancel-surprise', 
                                        'raise-preemptive', 'gold-double', 'drop-item-double'];
                    if (trait.dataId < abilityNames.length) {
                        analysis.partyAbilities.push(abilityNames[trait.dataId]);
                    }
                    break;
            }
        }
        
        static calculateFinalParams(battler, analysis) {
            if (!battler || !analysis) return;
            
            // Calculate effective parameters
            const baseParams = ['mhp', 'mmp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'];
            for (const param of baseParams) {
                if (!analysis.params[param]) {
                    analysis.params[param] = 1.0;
                }
                // Get actual parameter value
                analysis.params[param + '_value'] = battler[param] || 0;
            }
            
            // Ensure all ex-params have defaults
            const exParams = ['hit', 'eva', 'cri', 'cev', 'mev', 'mrf', 'cnt', 'hrg', 'mrg', 'trg'];
            for (const param of exParams) {
                if (!analysis.exParams[param]) {
                    analysis.exParams[param] = 0;
                }
            }
            
            // Ensure all sp-params have defaults
            const spParams = ['tgr', 'grd', 'rec', 'pha', 'mcr', 'tcr', 'pdr', 'mdr', 'fdr', 'exr'];
            for (const param of spParams) {
                if (!analysis.spParams[param]) {
                    analysis.spParams[param] = 1.0;
                }
            }
        }
    }
    
    // Equipment Analyzer
    class EquipmentAnalyzer {
        static analyzeActorEquipment(actor) {
            if (!actor || !actor.equips) return this.getDefaultAnalysis();
            
            const analysis = this.getDefaultAnalysis();
            const equips = actor.equips();
            
            for (let i = 0; i < equips.length; i++) {
                const item = equips[i];
                if (!item) continue;
                
                const itemAnalysis = {
                    id: item.id,
                    name: item.name,
                    type: item.etypeId,
                    params: {},
                    traits: []
                };
                
                // Analyze parameters
                if (item.params) {
                    for (let j = 0; j < item.params.length; j++) {
                        const value = item.params[j];
                        if (value !== 0) {
                            const paramName = ['mhp', 'mmp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'][j];
                            if (paramName) {
                                itemAnalysis.params[paramName] = value;
                                if (!analysis.totalParams[paramName]) {
                                    analysis.totalParams[paramName] = 0;
                                }
                                analysis.totalParams[paramName] += value;
                            }
                        }
                    }
                }
                
                // Analyze traits
                if (item.traits) {
                    for (const trait of item.traits) {
                        itemAnalysis.traits.push(trait);
                        this.processEquipmentTrait(trait, analysis);
                    }
                }
                
                // Add to appropriate category
                if (item.etypeId === 1) { // Weapon
                    analysis.weapons.push(itemAnalysis);
                    // Check for dual wield
                    if (i === 1 && item.wtypeId) {
                        analysis.hasDualWield = true;
                    }
                } else { // Armor
                    analysis.armors.push(itemAnalysis);
                }
            }
            
            // Check for auto-states from equips
            for (const item of equips) {
                if (!item || !item.note) continue;
                const match = item.note.match(/<auto[_\s]?state:\s*(\d+)>/i);
                if (match) {
                    const stateId = Number(match[1]);
                    const state = $dataStates[stateId];
                    if (state) {
                        analysis.autoStates.push(state.name);
                    }
                }
            }
            
            return analysis;
        }
        
        static getDefaultAnalysis() {
            return {
                weapons: [],
                armors: [],
                totalParams: {},
                addedElements: [],
                addedStates: [],
                resistElements: {},
                resistStates: {},
                addedSkills: [],
                specialEffects: [],
                hasReflection: false,
                hasCounter: false,
                hasDualWield: false,
                autoStates: []
            };
        }
        
        static processEquipmentTrait(trait, analysis) {
            if (!trait || !analysis) return;
            
            switch (trait.code) {
                case 11: // Element Rate
                    if (!analysis.resistElements[trait.dataId]) {
                        analysis.resistElements[trait.dataId] = 1.0;
                    }
                    analysis.resistElements[trait.dataId] *= trait.value;
                    break;
                    
                case 13: // State Rate
                    if (!analysis.resistStates[trait.dataId]) {
                        analysis.resistStates[trait.dataId] = 1.0;
                    }
                    analysis.resistStates[trait.dataId] *= trait.value;
                    break;
                    
                case 22: // Ex-Param
                    // Check for reflection (mrf) or counter (cnt)
                    if (trait.dataId === 5 && trait.value > 0) { // mrf
                        analysis.hasReflection = true;
                    }
                    if (trait.dataId === 6 && trait.value > 0) { // cnt
                        analysis.hasCounter = true;
                    }
                    break;
                    
                case 31: // Attack Element
                    if (!analysis.addedElements.includes(trait.dataId)) {
                        analysis.addedElements.push(trait.dataId);
                    }
                    break;
                    
                case 32: // Attack State
                    analysis.addedStates.push({
                        stateId: trait.dataId,
                        rate: trait.value
                    });
                    break;
                    
                case 44: // Added Skill
                    if (!analysis.addedSkills.includes(trait.dataId)) {
                        analysis.addedSkills.push(trait.dataId);
                    }
                    break;
                    
                case 62: // Special Flag
                    if (trait.dataId === 0) { // Auto-battle
                        analysis.autoStates.push('auto-battle');
                    }
                    break;
            }
        }
    }
    
    // Item Quantity Tracker
    class ItemQuantityTracker {
        static getItemQuantity(item) {
            if (!item) return 0;
            return $gameParty.numItems(item);
        }
        
        static analyzePartyItems() {
            const analysis = {
                healingItems: {},
                revivalItems: {},
                statusItems: {},
                buffItems: {},
                damageItems: {},
                totalHealingPower: 0,
                totalRevivalCount: 0
            };
            
            // Check all items in inventory
            const items = $gameParty.allItems().filter(item => DataManager.isItem(item));
            
            for (const item of items) {
                const quantity = this.getItemQuantity(item);
                if (quantity === 0) continue;
                
                const itemData = {
                    id: item.id,
                    name: item.name,
                    quantity: quantity,
                    scope: item.scope,
                    occasion: item.occasion,
                    effects: []
                };
                
                // Categorize by effects
                let category = 'other';
                let healingPower = 0;
                
                if (item.damage && item.damage.type >= 3) { // HP/MP recovery
                    category = 'healingItems';
                    if (item.damage.type === 3) { // HP recovery
                        healingPower = item.damage.formula ? 
                            (item.damage.formula.includes('%') ? 50 : 200) : 0;
                        analysis.totalHealingPower += healingPower * quantity;
                    }
                } else if (item.damage && item.damage.type > 0) { // Damage
                    category = 'damageItems';
                }
                
                // Check effects
                if (item.effects) {
                    for (const effect of item.effects) {
                        if (effect.code === 22 && effect.dataId === 1) { // Remove death
                            category = 'revivalItems';
                            analysis.totalRevivalCount += quantity;
                        } else if (effect.code === 22) { // Remove state
                            category = 'statusItems';
                        } else if (effect.code === 31 || effect.code === 32) { // Buff/Debuff
                            category = 'buffItems';
                        }
                    }
                }
                
                if (!analysis[category]) {
                    analysis[category] = {};
                }
                analysis[category][item.id] = itemData;
            }
            
            return analysis;
        }
        
        static calculateItemThreat(actorName) {
            const quantities = $globalAIMemory.playerProfile.itemQuantities;
            let threat = 0;
            
            // Calculate threat based on remaining healing items
            for (const itemId in quantities) {
                const item = $dataItems[itemId];
                if (!item) continue;
                
                const remaining = quantities[itemId];
                if (remaining > 0) {
                    if (item.damage && item.damage.type === 3) { // HP recovery
                        threat += remaining * 10;
                    } else if (item.effects && item.effects.some(e => e.code === 22 && e.dataId === 1)) { // Revival
                        threat += remaining * 30;
                    }
                }
            }
            
            return threat;
        }
    }
    
    // Player Profiler
    class PlayerProfiler {
        static updateProfile(action, subject, target, result) {
            const profile = $globalAIMemory.playerProfile;
            
            // Skip if not player action
            if (!subject || !subject.isActor || !subject.isActor()) return;
            if (!action || !action.item) return;
            
            // Track skill usage
            const skillId = action.item().id;
            if (!profile.skillUsage[skillId]) {
                profile.skillUsage[skillId] = {
                    uses: 0,
                    successRate: 0,
                    avgDamage: 0,
                    preferredTargets: {},
                    commonFollowUps: {}
                };
            }
            
            const skillData = profile.skillUsage[skillId];
            skillData.uses++;
            
            // Track targeting patterns
            if (target) {
                const targetType = target.isActor && target.isActor() ? 'ally' : 'enemy';
                if (!skillData.preferredTargets[targetType]) {
                    skillData.preferredTargets[targetType] = 0;
                }
                skillData.preferredTargets[targetType]++;
            }
            
            // Track damage
            if (result && result.damage > 0) {
                skillData.avgDamage = (skillData.avgDamage * (skillData.uses - 1) + result.damage) / skillData.uses;
            }
            
            // Update turn patterns
            const currentTurn = $gameTroop.turnCount();
            if (!profile.turnPatterns[currentTurn]) {
                profile.turnPatterns[currentTurn] = [];
            }
            profile.turnPatterns[currentTurn].push({
                actor: subject.name(),
                skill: skillId,
                target: target ? target.name() : null
            });
        }
        
        static predictNextAction(actor) {
            if (!actor) return null;
            
            const profile = $globalAIMemory.playerProfile;
            const currentTurn = $gameTroop.turnCount();
            
            // Check for patterns in previous battles
            const patternTurn = currentTurn % 5; // Look for 5-turn patterns
            if (profile.turnPatterns[patternTurn]) {
                const patterns = profile.turnPatterns[patternTurn].filter(p => p.actor === actor.name());
                if (patterns.length > 0) {
                    // Find most common pattern
                    const skillCounts = {};
                    for (const pattern of patterns) {
                        if (!skillCounts[pattern.skill]) {
                            skillCounts[pattern.skill] = 0;
                        }
                        skillCounts[pattern.skill]++;
                    }
                    
                    // Return most likely skill
                    let maxCount = 0;
                    let likelySkill = null;
                    for (const [skillId, count] of Object.entries(skillCounts)) {
                        if (count > maxCount) {
                            maxCount = count;
                            likelySkill = Number(skillId);
                        }
                    }
                    
                    return likelySkill;
                }
            }
            
            // Check HP-based patterns
            const hpRatio = actor.hp / actor.mhp;
            if (hpRatio < 0.3) {
                // Look for healing patterns
                for (const [skillId, data] of Object.entries(profile.skillUsage)) {
                    const skill = $dataSkills[Number(skillId)];
                    if (skill && skill.damage && skill.damage.type < 0) { // Healing
                        if (data.preferredTargets && data.preferredTargets['ally'] > 5) {
                            return Number(skillId);
                        }
                    }
                }
            }
            
            return null;
        }
    }
    
    // State Analyzer
    class StateAnalyzer {
        static categorizeState(state) {
            if (!state) return 'other';
            
            // Check restriction level
            if (state.restriction >= 4) {
                return 'disable_full'; // Cannot act at all
            } else if (state.restriction >= 2) {
                return 'disable_partial'; // Limited actions
            }
            
            // Check for DoT
            if (state.traits) {
                for (const trait of state.traits) {
                    if (trait.code === 22 && trait.dataId === 0 && trait.value < 0) {
                        return 'damage_over_time';
                    }
                }
            }
            
            // Check for stat changes
            let hasDebuff = false;
            if (state.traits) {
                for (const trait of state.traits) {
                    if (trait.code === 21 && trait.value < 1.0) {
                        hasDebuff = true;
                        break;
                    }
                }
            }
            if (hasDebuff) return 'debuff';
            
            // Check notetags
            const note = state.note || '';
            if (note.match(/<category:\s*disable>/i)) return 'disable_full';
            if (note.match(/<category:\s*dot>/i)) return 'damage_over_time';
            if (note.match(/<category:\s*debuff>/i)) return 'debuff';
            
            return 'other';
        }
        
        static getStateValue(state, target) {
            if (!state || !target) return 0;
            
            let value = 0;
            
            switch (this.categorizeState(state)) {
                case 'disable_full':
                    value = 100; // High value for full disable
                    break;
                case 'disable_partial':
                    value = 60;
                    break;
                case 'damage_over_time':
                    // Value based on potential damage
                    const slipDamage = this.calculateSlipDamage(state, target);
                    value = (slipDamage / target.mhp) * 50;
                    break;
                case 'debuff':
                    value = 40;
                    break;
                default:
                    value = 20;
            }
            
            // Multiply by remaining duration
            const remainingTurns = this.estimateRemainingTurns(state, target);
            value *= Math.min(remainingTurns, 5) / 5; // Cap value scaling at 5 turns
            
            return value;
        }
        
        static calculateSlipDamage(state, target) {
            if (!state || !target) return 0;
            
            let damage = 0;
            
            if (state.traits) {
                for (const trait of state.traits) {
                    if (trait.code === 22 && trait.dataId === 0 && trait.value < 0) {
                        damage = target.mhp * Math.abs(trait.value);
                        break;
                    }
                }
            }
            
            return damage;
        }
        
        static estimateRemainingTurns(state, target) {
            if (!state || !target) return 0;
            
            // Get the state counter from the target
            const stateCounter = target._stateTurns ? target._stateTurns[state.id] || 0 : 0;
            
            if (state.autoRemovalTiming === 1) { // Remove at end of turn
                return Math.max(stateCounter - 1, 0);
            } else if (state.autoRemovalTiming === 2) { // Remove at start of turn
                return Math.max(stateCounter, 0);
            }
            
            // For states without turn-based removal
            if (!state.minTurns && !state.maxTurns) {
                return 999; // Permanent until removed
            }
            
            // Average expected remaining turns
            return Math.max((state.minTurns + state.maxTurns) / 2 - stateCounter, 1);
        }
    }
    
    // Strategic Adaptation System
    class StrategicAdaptation {
        constructor() {
            this.combatPatterns = {};
            this.stalemateTurns = 0;
            this.currentStrategy = 'balanced';
        }
        
        trackCombatPattern(target, damage, wasHealed) {
            if (!target) return;
            
            const pattern = this.combatPatterns[target.name()] || {
                damageDealt: 0,
                healingReceived: 0,
                turns: 0,
                averageDamage: 0
            };
            
            pattern.turns++;
            pattern.damageDealt += damage;
            if (wasHealed) pattern.healingReceived += damage;
            pattern.averageDamage = pattern.damageDealt / pattern.turns;
            
            this.combatPatterns[target.name()] = pattern;
            
            // Detect stalemate
            const sustainRatio = pattern.healingReceived / Math.max(pattern.damageDealt, 1);
            if (sustainRatio > 0.8 && pattern.turns > 5) {
                this.stalemateTurns++;
            } else {
                this.stalemateTurns = Math.max(0, this.stalemateTurns - 1);
            }
        }
        
        getStrategyAdjustments() {
            const params = getPluginParams();
            const inStalemate = this.stalemateTurns > params.antiExploitThreshold;
            const highSustainTargets = [];
            
            // Identify high sustain targets
            for (const [name, pattern] of Object.entries(this.combatPatterns)) {
                if (pattern.healingReceived / Math.max(pattern.damageDealt, 1) > 0.7) {
                    highSustainTargets.push(name);
                }
            }
            
            return {
                inStalemate: inStalemate,
                prioritizeCC: inStalemate,
                prioritizeStatus: inStalemate,
                prioritizeDebuffs: inStalemate,
                avoidHighSustainTargets: highSustainTargets,
                strategyMultipliers: {
                    damage: inStalemate ? 0.7 : 1.0,
                    tactical: inStalemate ? 1.5 : 1.0,
                    burst: inStalemate ? 1.3 : 1.0,
                    lowHPBonus: inStalemate ? 1.5 : 1.0
                }
            };
        }
        
        reset() {
            this.combatPatterns = {};
            this.stalemateTurns = 0;
            this.currentStrategy = 'balanced';
        }
    }
    
    // Evolution Integration Helper
    class EvolutionIntegration {
        static getEvolutionData(enemyId) {
            return window.$enemyEvolutionData ? 
                window.$enemyEvolutionData[enemyId] : null;
        }

        static getEvolvedSkills(enemy) {
            if (!enemy || !enemy._enemyId) return [];
            const evoData = this.getEvolutionData(enemy._enemyId);
            return evoData && evoData.skills ? evoData.skills : [];
        }

        static isEvolvedEnemy(enemy) {
            if (!enemy || !enemy._enemyId) return false;
            const evoData = this.getEvolutionData(enemy._enemyId);
            if (!evoData) return false;

            return (evoData.skills && evoData.skills.length > 0) ||
                   (evoData.customTraits && evoData.customTraits.length > 0) ||
                   (evoData.databaseTraits && evoData.databaseTraits.length > 0) ||
                   Object.values(evoData.paramBoosts || {}).some(boost => boost > 0);
        }
    }
    
    // AI Decision Engine (Main Class)
    class AIDecisionEngine {
        constructor(enemy) {
            this.enemy = enemy;
            this.actions = [];
            this.battleState = null;
            this.battleMemory = this.getBattleMemory();
            this.teamDecisions = this.getTeamDecisions();
            this.stateAnalysisCache = {};
            this.skillAnalysisCache = {};
            this.traitAnalysisCache = {};
            this.strategicAdaptation = new StrategicAdaptation();
            
            const params = getPluginParams();
            this.difficultyBehavior = getDifficultyBehavior(params.difficultyMode);
            
            // Evolution integration
            try {
                this.isEvolved = EvolutionIntegration.isEvolvedEnemy(enemy);
                this.evolvedSkills = EvolutionIntegration.getEvolvedSkills(enemy) || [];
                
                if (params.debugMode && this.isEvolved) {
                    console.log(`${enemy.name()} is evolved with ${this.evolvedSkills.length} skills`);
                }
            } catch (error) {
                this.isEvolved = false;
                this.evolvedSkills = [];
                if (params.debugMode) {
                    console.log(`Evolution integration failed for ${enemy.name()}: ${error.message}`);
                }
            }
            
            this.enemyRole = this.getEnemyRole();
        }
        
        // Clear caches to prevent memory leaks
        clearCaches() {
            // Keep only the most recent entries
            const maxCacheSize = 20;
            
            if (Object.keys(this.stateAnalysisCache).length > maxCacheSize) {
                const keys = Object.keys(this.stateAnalysisCache);
                for (let i = 0; i < keys.length - maxCacheSize; i++) {
                    delete this.stateAnalysisCache[keys[i]];
                }
            }
            
            if (Object.keys(this.skillAnalysisCache).length > maxCacheSize) {
                const keys = Object.keys(this.skillAnalysisCache);
                for (let i = 0; i < keys.length - maxCacheSize; i++) {
                    delete this.skillAnalysisCache[keys[i]];
                }
            }
            
            if (Object.keys(this.traitAnalysisCache).length > maxCacheSize) {
                const keys = Object.keys(this.traitAnalysisCache);
                for (let i = 0; i < keys.length - maxCacheSize; i++) {
                    delete this.traitAnalysisCache[keys[i]];
                }
            }
        }
        
        // Get enemy role from notetag or analyze
        getEnemyRole() {
            if (!this.enemy || !this.enemy.enemy) return 'balanced';
            
            const note = this.enemy.enemy().note;
            const roleMatch = note ? note.match(/<ai_role:\s*(\w+)>/i) : null;
            
            if (roleMatch) {
                return roleMatch[1].toLowerCase();
            }
            
            // Auto-detect role based on skills
            const actions = this.enemy.enemy().actions || [];
            const skills = actions.map(a => $dataSkills[a.skillId]).filter(s => s);
            let healCount = 0, buffCount = 0, damageCount = 0, statusCount = 0;
            
            for (const skill of skills) {
                if (!skill) continue;
                if (skill.damage && skill.damage.type > 0) damageCount++;
                if (skill.damage && skill.damage.type < 0) healCount++;
                if (skill.effects) {
                    skill.effects.forEach(effect => {
                        if (effect.code === 21) statusCount++;
                        if (effect.code === 31 || effect.code === 32) buffCount++;
                    });
                }
            }
            
            if (healCount >= 2) return 'healer';
            if (buffCount >= 3) return 'support';
            if (statusCount >= 3) return 'controller';
            if (damageCount >= skills.length * 0.7) return 'dps';
            
            return 'balanced';
        }
        
        // Get battle memory
        getBattleMemory() {
            if (!$gameTemp._enemyAIMemory) {
                $gameTemp._enemyAIMemory = {};
            }
            
            if (!$gameTemp._enemyAIMemory[this.enemy.index()]) {
                $gameTemp._enemyAIMemory[this.enemy.index()] = {
                    skillHistory: {},
                    skillTargetHistory: {},
                    targetHistory: {},
                    targetDamageHistory: {},
                    elementalData: {},
                    stateResistance: {},
                    targetCapabilities: {},
                    turnCount: 0,
                    observedItems: {},
                    stateApplicationHistory: {}
                };
            }
            
            return $gameTemp._enemyAIMemory[this.enemy.index()];
        }
        
        // Get all available actions
        getAllAvailableActions() {
            const actions = [];
            
            if (!this.enemy || !this.enemy.enemy) return actions;
            
            // Get all enemy actions
            const enemyActions = this.enemy.enemy().actions || [];
            for (const action of enemyActions) {
                if (this.enemy.isActionValid && this.enemy.isActionValid(action)) {
                    const skill = $dataSkills[action.skillId];
                    if (skill && this.canUseSkill(skill)) {
                        actions.push({
                            action: action,
                            skill: skill,
                            skillId: skill.id,
                            rating: action.rating || 5,
                            tpCost: skill.tpCost,
                            mpCost: skill.mpCost
                        });
                    }
                }
            }
            
            // Add evolved skills if available
            if (this.isEvolved && this.evolvedSkills.length > 0) {
                for (const skillId of this.evolvedSkills) {
                    const skill = $dataSkills[skillId];
                    if (skill && this.canUseSkill(skill)) {
                        actions.push({
                            action: { skillId: skillId, rating: 7 },
                            skill: skill,
                            skillId: skill.id,
                            rating: 7,
                            tpCost: skill.tpCost,
                            mpCost: skill.mpCost
                        });
                    }
                }
            }
            
            return actions;
        }
        
        // Check if skill can be used
        canUseSkill(skill) {
            if (!skill || !this.enemy) return false;
            
            // Check MP cost
            if (skill.mpCost > 0 && this.enemy.mp < skill.mpCost) {
                return false;
            }
            
            // Check TP cost
            if (skill.tpCost > 0 && this.enemy.tp < skill.tpCost) {
                return false;
            }
            
            // Check if sealed
            if (this.enemy.isSkillSealed && this.enemy.isSkillSealed(skill.id)) {
                return false;
            }
            
            // Check if skill type is sealed
            if (this.enemy.isSkillTypeSealed && this.enemy.isSkillTypeSealed(skill.stypeId)) {
                return false;
            }
            
            return true;
        }
        
        // Get skill analysis
        getSkillAnalysis(skillId) {
            if (this.skillAnalysisCache[skillId]) {
                return this.skillAnalysisCache[skillId];
            }
            
            const skill = $dataSkills[skillId];
            if (!skill) return null;
            
            const analysis = {
                id: skillId,
                name: skill.name,
                skill: skill,
                scope: skill.scope,
                mpCost: skill.mpCost,
                tpCost: skill.tpCost,
                speed: skill.speed,
                successRate: skill.successRate,
                repeats: skill.repeats,
                tpGain: skill.tpGain,
                hitType: skill.hitType,
                animationId: skill.animationId,
                message1: skill.message1,
                message2: skill.message2,
                note: skill.note || '',
                categories: {
                    isDamage: false,
                    isHeal: false,
                    isDrain: false,
                    hasStatusEffect: false,
                    hasBuff: false,
                    hasDebuff: false,
                    hasSpecialEffect: false,
                    hasTPEffect: false
                },
                targeting: {
                    type: 'enemy',
                    random: false,
                    all: false,
                    dead: false
                },
                damage: null,
                effects: []
            };
            
            // Analyze scope
            this.analyzeSkillScope(analysis);
            
            // Analyze damage
            if (skill.damage && skill.damage.type > 0) {
                analysis.categories.isDamage = true;
                analysis.damage = {
                    type: skill.damage.type === 1 ? 'hp' : 'mp',
                    elementId: skill.damage.elementId,
                    formula: skill.damage.formula,
                    variance: skill.damage.variance,
                    critical: skill.damage.critical
                };
                
                if (skill.damage.type === 5) {
                    analysis.categories.isDrain = true;
                }
            } else if (skill.damage && skill.damage.type < 0) {
                analysis.categories.isHeal = true;
                analysis.damage = {
                    type: skill.damage.type === -1 ? 'hp' : 'mp',
                    elementId: skill.damage.elementId,
                    formula: skill.damage.formula,
                    variance: skill.damage.variance,
                    critical: false
                };
            }
            
            // Analyze effects
            if (skill.effects) {
                for (const effect of skill.effects) {
                    const effectAnalysis = this.analyzeEffect(effect);
                    if (effectAnalysis) {
                        analysis.effects.push(effectAnalysis);
                        
                        // Update categories
                        switch (effectAnalysis.category) {
                            case 'state_add':
                            case 'state_remove':
                                analysis.categories.hasStatusEffect = true;
                                break;
                            case 'buff':
                                analysis.categories.hasBuff = true;
                                break;
                            case 'debuff':
                                analysis.categories.hasDebuff = true;
                                break;
                            case 'special':
                            case 'grow':
                            case 'learn':
                                analysis.categories.hasSpecialEffect = true;
                                break;
                            case 'heal':
                                if (effectAnalysis.type === 'tp') {
                                    analysis.categories.hasTPEffect = true;
                                }
                                break;
                        }
                    }
                }
            }
            
            this.skillAnalysisCache[skillId] = analysis;
            return analysis;
        }
        
        // Analyze skill scope
        analyzeSkillScope(analysis) {
            if (!analysis) return;
            
            switch (analysis.scope) {
                case 1: // One Enemy
                    analysis.targeting.type = 'enemy';
                    break;
                case 2: // All Enemies
                    analysis.targeting.type = 'enemy';
                    analysis.targeting.all = true;
                    break;
                case 3: // Random Enemy
                    analysis.targeting.type = 'enemy';
                    analysis.targeting.random = true;
                    break;
                case 4: // 2 Random Enemies
                case 5: // 3 Random Enemies
                case 6: // 4 Random Enemies
                    analysis.targeting.type = 'enemy';
                    analysis.targeting.random = true;
                    analysis.targeting.count = analysis.scope - 2;
                    break;
                case 7: // One Ally
                    analysis.targeting.type = 'ally';
                    break;
                case 8: // All Allies
                    analysis.targeting.type = 'ally';
                    analysis.targeting.all = true;
                    break;
                case 9: // One Ally (Dead)
                    analysis.targeting.type = 'ally';
                    analysis.targeting.dead = true;
                    break;
                case 10: // All Allies (Dead)
                    analysis.targeting.type = 'ally';
                    analysis.targeting.all = true;
                    analysis.targeting.dead = true;
                    break;
                case 11: // User
                    analysis.targeting.type = 'self';
                    break;
                case 12: // One Ally (Alive)
                    analysis.targeting.type = 'ally';
                    break;
                case 13: // All Allies (Alive)
                    analysis.targeting.type = 'ally';
                    analysis.targeting.all = true;
                    break;
                case 14: // All Enemies and Allies
                    analysis.targeting.type = 'all';
                    break;
                default:
                    analysis.targeting.type = 'none';
            }
        }
        
        // Analyze skill effect
        analyzeEffect(effect) {
            if (!effect) return null;
            
            const analysis = {
                code: effect.code,
                dataId: effect.dataId,
                value1: effect.value1,
                value2: effect.value2
            };
            
            switch (effect.code) {
                case 11: // Recover HP
                    analysis.category = 'heal';
                    analysis.type = 'hp';
                    analysis.description = `Recover ${effect.value2 > 0 ? effect.value2 : effect.value1 * 100 + '%'} HP`;
                    break;
                case 12: // Recover MP
                    analysis.category = 'heal';
                    analysis.type = 'mp';
                    analysis.description = `Recover ${effect.value2 > 0 ? effect.value2 : effect.value1 * 100 + '%'} MP`;
                    break;
                case 13: // Gain TP
                    analysis.category = 'heal';
                    analysis.type = 'tp';
                    analysis.description = `Gain ${effect.value1} TP`;
                    break;
                    
                // States
                case 21: // Add State
                    analysis.category = 'state_add';
                    analysis.type = 'add';
                    analysis.stateId = effect.dataId;
                    analysis.chance = effect.value1 * 100;
                    analysis.description = `Add ${$dataStates[effect.dataId]?.name || 'State'} (${analysis.chance}%)`;
                    break;
                case 22: // Remove State
                    analysis.category = 'state_remove';
                    analysis.type = 'remove';
                    analysis.stateId = effect.dataId;
                    analysis.chance = effect.value1 * 100;
                    analysis.description = `Remove ${$dataStates[effect.dataId]?.name || 'State'} (${analysis.chance}%)`;
                    
                    // Special case for death removal
                    if (effect.dataId === 1) {
                        analysis.type = 'resurrect';
                        analysis.category = 'special';
                    }
                    break;
                    
                // Buffs & Debuffs
                case 31: // Add Buff
                    analysis.category = 'buff';
                    analysis.paramId = effect.dataId;
                    analysis.turns = effect.value1;
                    analysis.description = `Buff ${this.getParamName(effect.dataId)} for ${effect.value1} turns`;
                    break;
                case 32: // Add Debuff
                    analysis.category = 'debuff';
                    analysis.paramId = effect.dataId;
                    analysis.turns = effect.value1;
                    analysis.description = `Debuff ${this.getParamName(effect.dataId)} for ${effect.value1} turns`;
                    break;
                case 33: // Remove Buff
                    analysis.category = 'debuff';
                    analysis.type = 'remove_buff';
                    analysis.paramId = effect.dataId;
                    break;
                case 34: // Remove Debuff
                    analysis.category = 'buff';
                    analysis.type = 'remove_debuff';
                    analysis.paramId = effect.dataId;
                    break;
                    
                // Special Effects
                case 41: // Special Effect
                    analysis.category = 'special';
                    analysis.type = 'escape';
                    break;
                case 42: // Grow
                    analysis.category = 'grow';
                    analysis.paramId = effect.dataId;
                    analysis.value = effect.value1;
                    break;
                case 43: // Learn Skill
                    analysis.category = 'learn';
                    analysis.skillId = effect.dataId;
                    break;
                case 44: // Common Event
                    analysis.category = 'special';
                    analysis.type = 'common_event';
                    analysis.eventId = effect.dataId;
                    break;
                    
                // Other
                default:
                    analysis.category = 'other';
                    break;
            }
            
            return analysis;
        }
        
        // Get parameter name
        getParamName(paramId) {
            const names = ['Max HP', 'Max MP', 'Attack', 'Defense', 'M.Attack', 'M.Defense', 'Agility', 'Luck'];
            return names[paramId] || 'Unknown';
        }
        
        // State analysis with removal conditions
        getStateAnalysis(stateId) {
            if (this.stateAnalysisCache[stateId]) {
                return this.stateAnalysisCache[stateId];
            }
            
            const state = $dataStates[stateId];
            if (!state) return null;
            
            const analysis = {
                id: stateId,
                name: state.name,
                restriction: state.restriction,
                priority: state.priority,
                removeConditions: {
                    byDamage: state.removeByDamage,
                    byWalking: state.removeByWalking,
                    byRestriction: state.removeByRestriction,
                    atBattleEnd: state.removeAtBattleEnd,
                    autoRemovalTiming: state.autoRemovalTiming,
                    minTurns: state.minTurns,
                    maxTurns: state.maxTurns,
                    removeByDamageChance: state.chanceByDamage || 0
                },
                traits: state.traits || [],
                effects: {
                    slipDamage: 0,
                    paramChanges: {},
                    elementRates: {},
                    stateRates: {},
                    specialFlags: [],
                    attackElements: [],
                    attackStates: []
                },
                category: StateAnalyzer.categorizeState(state),
                notes: state.note || ''
            };
            
            // Analyze traits using TraitAnalyzer
            if (state.traits) {
                const traitAnalysis = TraitAnalyzer.getDefaultAnalysis();
                
                for (const trait of state.traits) {
                    analysis.traits.push(trait);
                    TraitAnalyzer.processTrait(trait, traitAnalysis);
                }
                
                // Copy analyzed traits to effects
                analysis.effects.elementRates = traitAnalysis.elementRates;
                analysis.effects.stateRates = traitAnalysis.stateRates;
                analysis.effects.paramChanges = traitAnalysis.params;
                analysis.effects.exParamChanges = traitAnalysis.exParams;
                analysis.effects.spParamChanges = traitAnalysis.spParams;
                analysis.effects.attackElements = traitAnalysis.attackElements;
                analysis.effects.attackStates = traitAnalysis.attackStates;
                
                // Check for slip damage
                if (traitAnalysis.exParams.hrg && traitAnalysis.exParams.hrg < 0) {
                    analysis.effects.slipDamage = traitAnalysis.exParams.hrg;
                }
            }
            
            // Cache the analysis
            this.stateAnalysisCache[stateId] = analysis;
            return analysis;
        }
        
        // Get trait analysis
        getTraitAnalysis(battler) {
            if (!battler) return TraitAnalyzer.getDefaultAnalysis();
            
            const key = battler.isActor && battler.isActor() ? 
                `actor_${battler.actorId()}` : `enemy_${battler.index()}`;
            if (!this.traitAnalysisCache[key]) {
                this.traitAnalysisCache[key] = TraitAnalyzer.analyzeBattler(battler);
            }
            return this.traitAnalysisCache[key];
        }
        
        // Enhanced battle state analysis
        analyzeBattleState() {
            const allies = $gameTroop.aliveMembers();
            const enemies = $gameParty.aliveMembers();
            
            this.battleState = {
                turnCount: this.battleMemory.turnCount || 0,
                allyCount: allies.length,
                enemyCount: enemies.length,
                allyAvgHpRatio: allies.length > 0 ? 
                    allies.reduce((sum, ally) => sum + ally.hp / ally.mhp, 0) / allies.length : 0,
                enemyAvgHpRatio: enemies.length > 0 ? 
                    enemies.reduce((sum, enemy) => sum + enemy.hp / enemy.mhp, 0) / enemies.length : 0,
                enemyHpRatio: this.enemy.hp / this.enemy.mhp,
                enemyMpRatio: this.enemy.mp / this.enemy.mmp,
                enemyTpRatio: this.enemy.tp / 100,
                activeStates: this.analyzeActiveStates(),
                comboPotential: this.analyzeComboPotential(),
                targetEquipment: {},
                enemyTraits: {},
                predictedActions: this.predictPlayerActions(),
                partyItemAnalysis: getPluginParams().considerItemQuantity ? 
                    ItemQuantityTracker.analyzePartyItems() : null
            };
            
            // Analyze all traits
            for (const enemy of enemies) {
                this.battleState.enemyTraits[enemy.name()] = this.getTraitAnalysis(enemy);
            }
            
            // Analyze equipment if enabled
            if (getPluginParams().analyzeEquipment) {
                for (const actor of enemies.filter(e => e.isActor && e.isActor())) {
                    this.battleState.targetEquipment[actor.name()] = 
                        EquipmentAnalyzer.analyzeActorEquipment(actor);
                    
                    // Store in memory for future battles
                    const equipKey = `${actor.name()}_equipment`;
                    $globalAIMemory.knownEquipment[equipKey] = this.battleState.targetEquipment[actor.name()];
                }
            }
        }
        
        // Predict player actions
        predictPlayerActions() {
            const predictions = {};
            
            if (this.difficultyBehavior.perfectPrediction) {
                for (const actor of $gameParty.aliveMembers()) {
                    const predictedSkill = PlayerProfiler.predictNextAction(actor);
                    if (predictedSkill) {
                        predictions[actor.name()] = predictedSkill;
                    }
                }
            }
            
            return predictions;
        }
        
        // Analyze all active states in battle
        analyzeActiveStates() {
            const states = {
                allies: {},
                enemies: {}
            };
            
            // Analyze ally states
            for (const ally of $gameTroop.aliveMembers()) {
                states.allies[ally.name()] = ally.states().map(state => this.getStateAnalysis(state.id));
            }
            
            // Analyze enemy states
            for (const enemy of $gameParty.aliveMembers()) {
                states.enemies[enemy.name()] = enemy.states().map(state => this.getStateAnalysis(state.id));
            }
            
            return states;
        }
        
        // Analyze potential combos based on current battle state
        analyzeComboPotential() {
            const combos = [];
            
            // Check each enemy for combo setup states
            for (const target of $gameParty.aliveMembers()) {
                const targetStates = target.states();
                const targetTraits = this.battleState && this.battleState.enemyTraits ?
                    this.battleState.enemyTraits[target.name()] : this.getTraitAnalysis(target);
                
                // Sleep + High damage combo
                if (targetStates.some(s => s.restriction >= 4)) {
                    combos.push({
                        type: 'sleep_damage',
                        target: target.name(),
                        priority: 'high'
                    });
                }
                
                // Multiple debuffs + finishing blow
                const debuffCount = this.countDebuffs(target);
                if (debuffCount >= 3) {
                    combos.push({
                        type: 'debuff_finish',
                        target: target.name(),
                        priority: 'medium',
                        debuffCount: debuffCount
                    });
                }
                
                // DoT stacking opportunity
                const dotStates = targetStates.filter(s => {
                    const analysis = this.getStateAnalysis(s.id);
                    return analysis && analysis.category === 'damage_over_time';
                });
                if (dotStates.length > 0 && dotStates.length < 3) {
                    combos.push({
                        type: 'dot_stack',
                        target: target.name(),
                        priority: 'low',
                        currentDots: dotStates.length
                    });
                }
                
                // Element weakness exploit
                if (targetTraits && targetTraits.elementRates) {
                    for (const [elementId, rate] of Object.entries(targetTraits.elementRates)) {
                        if (rate > 1.5) {
                            combos.push({
                                type: 'element_weakness',
                                target: target.name(),
                                elementId: Number(elementId),
                                rate: rate,
                                priority: 'medium'
                            });
                        }
                    }
                }
            }
            
            return combos;
        }
        
        // Count debuffs on target
        countDebuffs(target) {
            if (!target || !target._buffs) return 0;
            
            let count = 0;
            for (let i = 0; i < 8; i++) {
                if (target.isBuffAffected && target.isBuffAffected(i) && target._buffs[i] < 0) {
                    count += Math.abs(target._buffs[i]);
                }
            }
            return count;
        }
        
        // Check if action would remove beneficial states
        checkStateRemovalRisk(skillAnalysis, target) {
            if (!skillAnalysis || !target) return { risk: 0, stateValue: 0 };
            
            if (!skillAnalysis.categories.isDamage) {
                return { risk: 0, stateValue: 0 };
            }
            
            let totalRisk = 0;
            let totalStateValue = 0;
            const targetStates = target.states();
            
            for (const state of targetStates) {
                const stateAnalysis = this.getStateAnalysis(state.id);
                if (!stateAnalysis) continue;
                
                // Only consider states that can be removed by damage
                if (!stateAnalysis.removeConditions.byDamage) continue;
                
                // Calculate the value of this state
                const stateValue = StateAnalyzer.getStateValue(state, target);
                
                // Skip low-value states
                if (stateValue < 10) continue;
                
                // Calculate removal chance
                const removalChance = stateAnalysis.removeConditions.removeByDamageChance / 100;
                
                // Calculate risk (value * chance)
                const risk = stateValue * removalChance;
                
                totalRisk += risk;
                totalStateValue += stateValue;
                
                const params = getPluginParams();
                if (params.debugMode) {
                    console.log(`State ${state.name} on ${target.name()}: Value=${stateValue.toFixed(1)}, RemovalChance=${(removalChance * 100).toFixed(0)}%, Risk=${risk.toFixed(1)}`);
                }
            }
            
            return { risk: totalRisk, stateValue: totalStateValue };
        }
        
        // Find alternative actions that don't risk state removal
        findAlternativeActions(skillAnalysis, currentTargets) {
            const alternatives = [];
            const allActions = this.getAllAvailableActions();
            
            for (const action of allActions) {
                const altSkillAnalysis = this.getSkillAnalysis(action.skillId);
                
                // Skip damaging skills
                if (altSkillAnalysis && altSkillAnalysis.categories.isDamage) continue;
                
                // Check if this is a viable alternative
                if (altSkillAnalysis && (altSkillAnalysis.categories.hasStatusEffect ||
                    altSkillAnalysis.categories.hasBuff ||
                    altSkillAnalysis.categories.hasDebuff ||
                    altSkillAnalysis.categories.isHeal)) {
                    
                    // Get appropriate targets for this skill
                    const altTargets = this.getPotentialTargetsEnhanced(action.skill, altSkillAnalysis);
                    
                    if (altTargets && altTargets.length > 0) {
                        alternatives.push({
                            action: action,
                            skillAnalysis: altSkillAnalysis,
                            targets: altTargets,
                            priority: this.calculateAlternativePriority(altSkillAnalysis)
                        });
                    }
                }
            }
            
            return alternatives.sort((a, b) => b.priority - a.priority);
        }
        
        // Calculate priority for alternative actions
        calculateAlternativePriority(skillAnalysis) {
            if (!skillAnalysis) return 0;
            
            let priority = 0;
            
            if (skillAnalysis.categories.hasStatusEffect) {
                priority += 40;
            }
            if (skillAnalysis.categories.hasBuff) {
                priority += 35;
            }
            if (skillAnalysis.categories.hasDebuff) {
                priority += 30;
            }
            if (skillAnalysis.categories.isHeal) {
                // Healing priority based on team HP
                const avgHpRatio = $gameTroop.aliveMembers().reduce((sum, member) => 
                    sum + member.hp / member.mhp, 0) / Math.max($gameTroop.aliveMembers().length, 1);
                priority += (1 - avgHpRatio) * 50;
            }
            
            return priority;
        }
        
        // Get potential targets with trait analysis
        getPotentialTargetsEnhanced(skill, skillAnalysis) {
            if (!skill || !skillAnalysis) return [];
            
            const targeting = skillAnalysis.targeting;
            let targets = [];
            
            switch (targeting.type) {
                case 'self':
                    targets = [this.enemy];
                    break;
                    
                case 'enemy':
                    let potentials = targeting.dead ? 
                        $gameParty.members().filter(m => m.isDead && m.isDead()) :
                        $gameParty.aliveMembers();
                    
                    if (targeting.all) {
                        targets = potentials;
                    } else if (targeting.random) {
                        const count = targeting.count || 1;
                        for (let i = 0; i < count && potentials.length > 0; i++) {
                            const index = Math.floor(Math.random() * potentials.length);
                            targets.push(potentials[index]);
                            potentials.splice(index, 1);
                        }
                    } else {
                        // Filter status targets if applicable
                        if (skillAnalysis.categories.hasStatusEffect) {
                            potentials = this.filterStatusTargets(potentials, skillAnalysis);
                        }
                        
                        const optimal = this.selectOptimalTargetEnhanced(potentials, skillAnalysis);
                        targets = optimal ? [optimal] : [];
                    }
                    break;
                    
                case 'ally':
                    let allies = targeting.dead ? 
                        $gameTroop.members().filter(m => m.isDead && m.isDead()) :
                        $gameTroop.aliveMembers();
                    
                    if (targeting.all) {
                        targets = allies;
                    } else {
                        const optimal = this.selectOptimalAllyEnhanced(allies, skillAnalysis);
                        targets = optimal ? [optimal] : [];
                    }
                    break;
                    
                case 'all':
                    targets = [...$gameTroop.aliveMembers(), ...$gameParty.aliveMembers()];
                    break;
            }
            
            return targets;
        }
        
        // Filter targets that would benefit from status effects
        filterStatusTargets(potentials, skillAnalysis) {
            if (!potentials || !skillAnalysis) return [];
            
            return potentials.filter(target => {
                const targetTraits = this.getTraitAnalysis(target);
                
                if (skillAnalysis.effects) {
                    for (const effect of skillAnalysis.effects) {
                        if (effect.category === 'state_add') {
                            // Check if target already has the state
                            if (target.isStateAffected && target.isStateAffected(effect.stateId)) continue;
                            
                            // Check state resistance from traits
                            const stateRate = targetTraits.stateRates[effect.stateId] || 1.0;
                            if (targetTraits.stateResists.includes(effect.stateId)) continue;
                            if (stateRate <= 0) continue;
                            
                            return true;
                        }
                    }
                }
                return false;
            });
        }
        
        // Enhanced target selection with state preservation awareness
        selectOptimalTargetEnhanced(potentials, skillAnalysis) {
            if (!potentials || potentials.length === 0 || !skillAnalysis) return null;
            
            let bestTarget = null;
            let bestScore = -Infinity;
            
            const strategy = this.strategicAdaptation.getStrategyAdjustments();
            
            for (const target of potentials) {
                let score = 0;
                const targetTraits = this.getTraitAnalysis(target);
                const targetEquip = this.battleState && this.battleState.targetEquipment ?
                    this.battleState.targetEquipment[target.name()] : null;
                const threat = this.assessThreatLevel(target);
                const isHighSustain = strategy.avoidHighSustainTargets.includes(target.name());
                
                // Base threat score
                score += threat * 10;
                
                // HP-based targeting
                const hpRatio = target.hp / target.mhp;
                score += (1 - hpRatio) * 30;
                
                // State preservation consideration
                if (skillAnalysis.categories.isDamage) {
                    const stateRisk = this.checkStateRemovalRisk(skillAnalysis, target);
                    
                    // Heavy penalty for risking high-value states
                    if (stateRisk.risk > 50) {
                        score -= stateRisk.risk * 2;
                        
                        const params = getPluginParams();
                        if (params.debugMode) {
                            console.log(`${target.name()} state removal risk: ${stateRisk.risk.toFixed(1)} (Total state value: ${stateRisk.stateValue.toFixed(1)})`);
                        }
                    }
                }
                
                // Damage calculations
                if (skillAnalysis.categories.isDamage) {
                    const damage = this.estimateDamageEnhanced(skillAnalysis.skill, target, skillAnalysis);
                    const lethalDamage = damage >= target.hp;
                    
                    if (lethalDamage) {
                        score += 200;
                        if (threat > 0.7) score += 100;
                    } else {
                        score += (damage / target.mhp) * 50;
                    }
                    
                    // Element rate considerations
                    const elementRate = this.getElementRate(target, skillAnalysis.damage?.elementId || -1);
                    if (elementRate > 1) {
                        score += (elementRate - 1) * 30;
                    } else if (elementRate < 1) {
                        score -= (1 - elementRate) * 50;
                    }
                    
                    // Stalemate avoidance
                    if (strategy.inStalemate && isHighSustain) {
                        score *= 0.3;
                    }
                    
                    // Defense calculations
                    const physicalDef = this.calculateEffectiveDefense(target, 'physical', targetTraits, targetEquip);
                    score += (1 - physicalDef / (this.enemy.atk * 4)) * 20;
                    
                    const magicalDef = this.calculateEffectiveDefense(target, 'magical', targetTraits, targetEquip);
                    score += (1 - magicalDef / (this.enemy.mat * 4)) * 20;
                    
                    // Hit chance
                    const hitChance = this.calculateHitChance(this.enemy, target, targetTraits);
                    score *= hitChance;
                    
                    score *= strategy.strategyMultipliers.damage;
                }
                
                // Status effect considerations
                if (skillAnalysis.categories.hasStatusEffect && skillAnalysis.effects) {
                    let statusScore = 0;
                    
                    for (const effect of skillAnalysis.effects) {
                        if (effect.category === 'state_add') {
                            const stateAnalysis = this.getStateAnalysis(effect.stateId);
                            if (!stateAnalysis) continue;
                            
                            // Skip if already affected
                            if (target.isStateAffected && target.isStateAffected(effect.stateId)) {
                                score -= 100;
                                continue;
                            }
                            
                            // Check resistance from traits
                            if (targetTraits.stateResists.includes(effect.stateId)) {
                                score -= 1000;
                                continue;
                            }
                            
                            const stateRate = targetTraits.stateRates[effect.stateId] || 1.0;
                            if (stateRate <= 0) {
                                score -= 1000;
                                continue;
                            }
                            
                            // Extra bonus for CC on high sustain targets
                            if (isHighSustain && strategy.inStalemate) {
                                switch (stateAnalysis.category) {
                                    case 'disable_full':
                                        statusScore += threat * 1.0;
                                        break;
                                    case 'disable_partial':
                                        statusScore += threat * 0.6;
                                        break;
                                    default:
                                        statusScore += threat * 0.3;
                                }
                            } else {
                                // Normal scoring
                                switch (stateAnalysis.category) {
                                    case 'disable_full':
                                        statusScore += threat * 0.5;
                                        break;
                                    case 'disable_partial':
                                        statusScore += threat * 0.3;
                                        break;
                                    case 'damage_over_time':
                                        statusScore += (target.hp / target.mhp) * 40;
                                        break;
                                    case 'debuff':
                                        statusScore += threat * 0.2;
                                        break;
                                }
                            }
                            
                            // Apply success chance with trait-based rate
                            statusScore *= stateRate * (effect.chance / 100);
                        }
                    }
                    
                    score += statusScore * strategy.strategyMultipliers.tactical;
                }
                
                // Buff/Debuff considerations
                if (skillAnalysis.categories.hasDebuff && skillAnalysis.effects) {
                    let debuffScore = 0;
                    
                    // Prioritize high-stat enemies
                    const totalStats = target.atk + target.mat + target.def + target.mdf;
                    debuffScore += totalStats / 100;
                    
                    // Extra value for debuffing healers/high sustain during stalemate
                    if (isHighSustain && strategy.inStalemate) {
                        debuffScore *= 2;
                    }
                    
                    // Check debuff resistance
                    for (const effect of skillAnalysis.effects) {
                        if (effect.category === 'debuff') {
                            const debuffRate = targetTraits.debuffRates[effect.paramId] || 1.0;
                            if (debuffRate <= 0) {
                                debuffScore *= 0;
                            } else {
                                debuffScore *= debuffRate;
                            }
                        }
                    }
                    
                    score += debuffScore * strategy.strategyMultipliers.tactical;
                }
                
                // Equipment-based adjustments
                if (targetEquip) {
                    if (targetEquip.hasReflection && skillAnalysis.categories.isDamage && 
                        skillAnalysis.damage?.type === 'magical') {
                        score -= 100;
                    }
                    
                    if (targetEquip.hasCounter && skillAnalysis.categories.isDamage && 
                        skillAnalysis.damage?.type === 'physical') {
                        score -= 50;
                    }
                    
                    if (targetEquip.autoStates.length > 0) {
                        score += 20;
                    }
                }
                
                // Historical success rate
                const successRate = this.getSkillTargetSuccessRate(skillAnalysis.id, target.name());
                if (successRate !== null) {
                    score *= successRate;
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = target;
                }
            }
            
            return bestTarget;
        }
        
        // Select optimal ally for buff/heal
        selectOptimalAllyEnhanced(allies, skillAnalysis) {
            if (!allies || allies.length === 0 || !skillAnalysis) return null;
            
            let bestAlly = null;
            let bestScore = -Infinity;
            
            for (const ally of allies) {
                let score = 0;
                const allyTraits = this.getTraitAnalysis(ally);
                
                // Healing considerations
                if (skillAnalysis.categories.isHeal) {
                    const missingHp = ally.mhp - ally.hp;
                    const hpRatio = ally.hp / ally.mhp;
                    
                    // Base healing score
                    score += (missingHp / ally.mhp) * 100;
                    
                    // Critical HP bonus
                    if (hpRatio < 0.3) {
                        score += 50;
                    }
                    
                    // Consider healing efficiency
                    const healingRate = allyTraits.spParams.rec || 1.0;
                    score *= healingRate;
                    
                    // Prioritize healer/support roles
                    if (this.getEnemyRole() === 'healer' || this.getEnemyRole() === 'support') {
                        score *= 1.2;
                    }
                }
                
                // Buff considerations
                if (skillAnalysis.categories.hasBuff && skillAnalysis.effects) {
                    // Prioritize high-damage dealers for buffs
                    const attackPower = Math.max(ally.atk, ally.mat);
                    score += (attackPower / 100) * 30;
                    
                    // Consider ally's HP ratio (buff healthy allies)
                    const hpRatio = ally.hp / ally.mhp;
                    score += hpRatio * 20;
                    
                    // Check if already buffed
                    for (const effect of skillAnalysis.effects) {
                        if (effect.category === 'buff' && ally._buffs) {
                            const buffLevel = ally._buffs[effect.paramId] || 0;
                            if (buffLevel >= 2) {
                                score -= 50; // Already max buffed
                            }
                        }
                    }
                }
                
                // Status removal considerations
                if (skillAnalysis.categories.hasStatusEffect && skillAnalysis.effects) {
                    for (const effect of skillAnalysis.effects) {
                        if (effect.category === 'state_remove') {
                            if (ally.isStateAffected && ally.isStateAffected(effect.stateId)) {
                                const stateAnalysis = this.getStateAnalysis(effect.stateId);
                                if (stateAnalysis) {
                                    // Prioritize removing disabling states
                                    switch (stateAnalysis.category) {
                                        case 'disable_full':
                                            score += 100;
                                            break;
                                        case 'disable_partial':
                                            score += 70;
                                            break;
                                        case 'damage_over_time':
                                            score += 50;
                                            break;
                                        default:
                                            score += 30;
                                    }
                                }
                            }
                        }
                    }
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestAlly = ally;
                }
            }
            
            return bestAlly;
        }
        
        // Assess threat level of target
        assessThreatLevel(target) {
            if (!target) return 0;
            
            let threat = 0;
            const traits = this.getTraitAnalysis(target);
            
            // Base threat from stats
            const attackPower = Math.max(target.atk, target.mat);
            const defense = (target.def + target.mdf) / 2;
            threat += (attackPower / 100) * 0.4;
            threat += (1 - defense / 500) * 0.2;
            
            // HP ratio (healthy enemies are more threatening)
            threat += (target.hp / target.mhp) * 0.2;
            
            // Speed (faster enemies act more often)
            threat += (target.agi / 100) * 0.1;
            
            // Check for dangerous skills in capabilities
            const caps = this.battleMemory.targetCapabilities[target.name()];
            if (caps) {
                if (caps.canHeal) threat += 0.2;
                if (caps.canRevive) threat += 0.3;
                if (caps.hasAOE) threat += 0.2;
                if (caps.hasStatus) threat += 0.1;
            }
            
            // Item threat
            const params = getPluginParams();
            if (params.considerItemQuantity) {
                const itemThreat = ItemQuantityTracker.calculateItemThreat(target.name());
                threat += itemThreat / 100;
            }
            
            // Trait-based threats
            if (traits.exParams.cnt > 0) threat += 0.1; // Counter
            if (traits.exParams.mrf > 0) threat += 0.1; // Magic reflection
            if (traits.spParams.pdr < 1) threat += 0.1; // Physical damage reduction
            if (traits.spParams.mdr < 1) threat += 0.1; // Magical damage reduction
            
            return Math.min(1, threat);
        }
        
        // Get element rate from memory or traits
        getElementRate(target, elementId) {
            if (!target || elementId < 0) return 1;
            
            // Check memory first
            const elementKey = `${target.name()}_element_${elementId}`;
            if (this.battleMemory.elementalData[elementKey]) {
                return this.battleMemory.elementalData[elementKey].rate;
            }
            
            // Get from trait analysis
            const traits = this.getTraitAnalysis(target);
            return traits.elementRates[elementId] || 1.0;
        }
        
        // Estimate damage with trait analysis
        estimateDamageEnhanced(skill, target, skillAnalysis) {
            if (!skill || !target || !skillAnalysis || !skillAnalysis.damage) return 0;
            
            const a = this.enemy;
            const b = target;
            const v = $gameVariables._data;
            let damage = 0;
            
            // Evaluate damage formula safely
            damage = SafeFormulaEvaluator.evaluate(skillAnalysis.damage.formula, a, b, v);
            
            // Apply variance
            if (skillAnalysis.damage.variance > 0) {
                const variance = skillAnalysis.damage.variance;
                const amp = Math.floor(Math.max(damage * variance / 100, 0));
                const randomValue = Math.floor(Math.random() * (amp + 1));
                damage += randomValue - amp / 2;
            }
            
            // Apply element rate
            if (skillAnalysis.damage.elementId >= 0) {
                const elementRate = this.getElementRate(target, skillAnalysis.damage.elementId);
                damage *= elementRate;
            }
            
            // Apply defense
            const targetTraits = this.getTraitAnalysis(target);
            const targetEquip = this.battleState && this.battleState.targetEquipment ?
                this.battleState.targetEquipment[target.name()] : null;
            
            if (skillAnalysis.damage.type === 'hp') {
                // Physical or magical damage
                const isPhysical = skillAnalysis.hitType === 1;
                const defType = isPhysical ? 'physical' : 'magical';
                const effectiveDef = this.calculateEffectiveDefense(target, defType, targetTraits, targetEquip);
                
                // Apply defense reduction
                damage *= (1 - effectiveDef / (effectiveDef + 100));
                
                // Apply PDR/MDR
                if (isPhysical) {
                    damage *= targetTraits.spParams.pdr || 1.0;
                } else {
                    damage *= targetTraits.spParams.mdr || 1.0;
                }
            }
            
            // Apply critical hit chance
            if (skillAnalysis.damage.critical) {
                const criticalRate = (a.cri || 0) * (1 - (targetTraits.exParams.cev || 0));
                if (Math.random() < criticalRate) {
                    damage *= 3; // Critical damage multiplier
                }
            }
            
            // Guard consideration
            if (target.isGuard && target.isGuard()) {
                damage *= targetTraits.spParams.grd || 1.0;
            }
            
            return Math.max(0, Math.floor(damage));
        }
        
        // Calculate effective defense
        calculateEffectiveDefense(target, type, traits, equipment) {
            if (!target || !traits) return 0;
            
            let defense = 0;
            
            if (type === 'physical') {
                defense = target.def;
                // Apply trait multiplier
                defense *= traits.params.def || 1.0;
            } else {
                defense = target.mdf;
                // Apply trait multiplier
                defense *= traits.params.mdf || 1.0;
            }
            
            // Equipment bonuses
            if (equipment) {
                if (type === 'physical' && equipment.totalParams.def) {
                    defense += equipment.totalParams.def;
                } else if (type === 'magical' && equipment.totalParams.mdf) {
                    defense += equipment.totalParams.mdf;
                }
            }
            
            return defense;
        }
        
        // Calculate hit chance
        calculateHitChance(attacker, target, targetTraits) {
            if (!attacker || !target || !targetTraits) return 0.95;
            
            const hitRate = attacker.hit || 0.95;
            const evaRate = targetTraits.exParams.eva || 0;
            const mevRate = targetTraits.exParams.mev || 0;
            
            // Use appropriate evasion
            const isPhysical = attacker.attackSkillId ? 
                ($dataSkills[attacker.attackSkillId()] && $dataSkills[attacker.attackSkillId()].hitType === 1) : true;
            const actualEva = isPhysical ? evaRate : mevRate;
            
            return Math.max(0.05, Math.min(1, hitRate - actualEva));
        }
        
        // Get skill target success rate from history
        getSkillTargetSuccessRate(skillId, targetName) {
            const key = `${skillId}_${targetName}`;
            const history = this.battleMemory.skillTargetHistory[key];
            
            if (!history || history.attempts < 2) {
                return null; // Not enough data
            }
            
            return history.successes / history.attempts;
        }
        
        // Get historical modifier for skill
        getHistoricalModifier(skillId) {
            const history = this.battleMemory.skillHistory[skillId];
            if (!history || history.uses < 3) {
                return 1.0; // Not enough data
            }
            
            const successRate = history.successes / history.uses;
            
            // Apply learning rate
            const learningModifier = 1 + (this.difficultyBehavior.learningRate * (successRate - 0.5));
            
            return Math.max(0.5, Math.min(1.5, learningModifier));
        }
        
        // Enhanced action evaluation with state preservation
        evaluateAction(action) {
            if (!action) return { totalScore: -1 };
            
            const skillAnalysis = this.getSkillAnalysis(action.skillId);
            if (!skillAnalysis) return { totalScore: -1 };
            
            const evaluation = {
                action: action,
                skillAnalysis: skillAnalysis,
                survivalScore: 0,
                damageScore: 0,
                supportScore: 0,
                tacticalScore: 0,
                teamScore: 0,
                comboScore: 0,
                statePreservationScore: 0,
                totalScore: 0,
                targets: []
            };
            
            // Get potential targets
            const targets = this.getPotentialTargetsEnhanced(action.skill, skillAnalysis);
            evaluation.targets = targets;
            
            // Skip if no valid targets
            if ((!targets || targets.length === 0) && 
                skillAnalysis.targeting.type !== 'self' && 
                skillAnalysis.targeting.type !== 'none') {
                evaluation.totalScore = -1;
                return evaluation;
            }
            
            // Check state preservation concerns
            if (skillAnalysis.categories.isDamage && targets.length > 0) {
                let totalStateRisk = 0;
                let highValueStatesAtRisk = false;
                
                for (const target of targets) {
                    const stateRisk = this.checkStateRemovalRisk(skillAnalysis, target);
                    totalStateRisk += stateRisk.risk;
                    
                    // Check if high-value states are at risk
                    if (stateRisk.stateValue > 50) {
                        highValueStatesAtRisk = true;
                    }
                }
                
                // Apply state preservation scoring
                if (totalStateRisk > 0) {
                    evaluation.statePreservationScore = -totalStateRisk;
                    
                    const params = getPluginParams();
                    // If high-value states at risk, check for alternatives
                    if (highValueStatesAtRisk && totalStateRisk > 30) {
                        const alternatives = this.findAlternativeActions(skillAnalysis, targets);
                        
                        if (alternatives.length > 0 && params.debugMode) {
                            console.log(`Found ${alternatives.length} alternative actions to preserve states`);
                        }
                        
                        // Apply bonus for having good alternatives available
                        if (alternatives.length > 0 && alternatives[0].priority > 30) {
                            evaluation.statePreservationScore -= params.statePreservationBonus;
                        }
                    }
                }
            }
            
            // Calculate scores based on skill categories
            if (skillAnalysis.categories.isHeal) {
                evaluation.survivalScore = this.calculateHealingScoreEnhanced(action, targets, skillAnalysis);
            }
            
            if (skillAnalysis.categories.isDamage || skillAnalysis.categories.isDrain) {
                evaluation.damageScore = this.calculateDamageScoreEnhanced(action, targets, skillAnalysis);
                
                if (skillAnalysis.categories.isDrain) {
                    evaluation.survivalScore += this.calculateDrainHealingScore(action, targets, skillAnalysis);
                }
            }
            
            if (skillAnalysis.categories.hasStatusEffect) {
                const statusScore = this.calculateStatusEffectScoreEnhanced(action, targets, skillAnalysis);
                if (skillAnalysis.categories.isDamage || skillAnalysis.categories.isHeal) {
                    evaluation.supportScore += statusScore;
                } else {
                    evaluation.tacticalScore += statusScore;
                }
            }
            
            if (skillAnalysis.categories.hasBuff || skillAnalysis.categories.hasDebuff) {
                const buffDebuffScore = this.calculateBuffDebuffScoreEnhanced(action, targets, skillAnalysis);
                evaluation.supportScore += buffDebuffScore;
            }
            
            if (skillAnalysis.categories.hasSpecialEffect) {
                evaluation.tacticalScore += this.calculateSpecialEffectScore(action, targets, skillAnalysis);
            }
            
            if (skillAnalysis.categories.hasTPEffect) {
                evaluation.tacticalScore += this.calculateTPEffectScore(action, targets, skillAnalysis);
            }
            
            // Check for combo opportunities
            evaluation.comboScore = this.checkComboOpportunitiesEnhanced(skillAnalysis, targets);
            
            // Team coordination
            evaluation.teamScore = this.calculateTeamCoordinationScore(action, targets, skillAnalysis);
            
            // Apply historical success rate modifier
            const historyModifier = this.getHistoricalModifier(action.skillId);
            
            // Calculate final weighted score
            const params = getPluginParams();
            evaluation.totalScore = 
                (evaluation.survivalScore * params.survivalWeight) +
                (evaluation.damageScore * params.damageWeight) +
                (evaluation.supportScore * params.supportWeight) +
                (evaluation.tacticalScore * params.tacticalWeight) +
                (evaluation.teamScore * 0.2) +
                (evaluation.comboScore * 0.15) +
                (evaluation.statePreservationScore * params.statePreservationWeight);
            
            // Apply modifiers
            evaluation.totalScore *= this.calculateEfficiencyModifierEnhanced(action, skillAnalysis);
            evaluation.totalScore *= historyModifier;
            
            // Apply hit rate and success rate penalties
            evaluation.totalScore *= (skillAnalysis.successRate / 100);
            
            // Apply difficulty multiplier
            const diffMultiplier = typeof this.difficultyBehavior.multiplier === 'function' ?
                this.difficultyBehavior.multiplier() : this.difficultyBehavior.multiplier;
            evaluation.totalScore *= diffMultiplier;
            
            // Apply role modifiers
            evaluation.totalScore *= this.getRoleModifier(skillAnalysis);
            
            return evaluation;
        }
        
        // Calculate healing score
        calculateHealingScoreEnhanced(action, targets, skillAnalysis) {
            if (!targets || !skillAnalysis) return 0;
            
            let score = 0;
            const params = getPluginParams();
            
            for (const target of targets) {
                const missingHp = target.mhp - target.hp;
                const hpRatio = target.hp / target.mhp;
                
                // Base healing value
                let healValue = missingHp / target.mhp * 100;
                
                // Critical HP bonus
                if (hpRatio < 0.3) {
                    healValue *= 2;
                } else if (hpRatio < params.healingThreshold) {
                    healValue *= 1.5;
                }
                
                // Consider healing power
                const estimatedHeal = this.estimateHealingAmount(skillAnalysis, target);
                const overheal = Math.max(0, estimatedHeal - missingHp);
                const efficiency = estimatedHeal > 0 ? 1 - (overheal / estimatedHeal) : 0;
                
                healValue *= efficiency;
                
                // Team coordination - avoid healing already assigned targets
                if (this.teamDecisions.healingAssigned[target.name()]) {
                    healValue *= 0.3;
                }
                
                // Trait considerations
                const targetTraits = this.getTraitAnalysis(target);
                healValue *= targetTraits.spParams.rec || 1.0;
                
                score += healValue;
            }
            
            return score;
        }
        
        // Estimate healing amount
        estimateHealingAmount(skillAnalysis, target) {
            if (!skillAnalysis || !target || !skillAnalysis.damage || skillAnalysis.damage.type >= 0) return 0;
            
            const a = this.enemy;
            const b = target;
            const v = $gameVariables._data;
            
            let healing = Math.abs(SafeFormulaEvaluator.evaluate(skillAnalysis.damage.formula, a, b, v));
            
            // Apply variance
            if (skillAnalysis.damage.variance > 0) {
                const variance = skillAnalysis.damage.variance;
                const amp = Math.floor(Math.max(healing * variance / 100, 0));
                const randomValue = Math.floor(Math.random() * (amp + 1));
                healing += randomValue - amp / 2;
            }
            
            // Apply recovery rate
            const targetTraits = this.getTraitAnalysis(target);
            healing *= targetTraits.spParams.rec || 1.0;
            
            // Apply pharmacology
            const myTraits = this.getTraitAnalysis(this.enemy);
            healing *= myTraits.spParams.pha || 1.0;
            
            return Math.floor(healing);
        }
        
        // Calculate damage score
        calculateDamageScoreEnhanced(action, targets, skillAnalysis) {
            if (!targets || !skillAnalysis) return 0;
            
            let score = 0;
            const strategy = this.strategicAdaptation.getStrategyAdjustments();
            
            for (const target of targets) {
                const damage = this.estimateDamageEnhanced(action.skill, target, skillAnalysis);
                const targetHp = target.hp;
                const lethalDamage = damage >= targetHp;
                
                // Base damage score
                let damageScore = (damage / target.mhp) * 50;
                
                // Lethal damage bonus
                if (lethalDamage) {
                    damageScore += 100;
                    const threat = this.assessThreatLevel(target);
                    if (threat > 0.7) {
                        damageScore += 50; // High threat elimination
                    }
                }
                
                // Overkill penalty
                const overkill = Math.max(0, damage - targetHp);
                if (overkill > targetHp * 0.5) {
                    damageScore *= 0.8;
                }
                
                // Team coordination
                const expectedDamage = this.teamDecisions.expectedDamage[target.name()] || 0;
                if (expectedDamage + damage > targetHp * 1.5) {
                    damageScore *= 0.6; // Avoid over-focusing
                }
                
                // Low HP target bonus
                if (target.hp / target.mhp < 0.3) {
                    damageScore *= strategy.strategyMultipliers.lowHPBonus;
                }
                
                score += damageScore;
            }
            
            return score;
        }
        
        // Calculate drain healing score
        calculateDrainHealingScore(action, targets, skillAnalysis) {
            if (!targets || !skillAnalysis) return 0;
            
            const missingHp = this.enemy.mhp - this.enemy.hp;
            if (missingHp === 0) return 0;
            
            let totalDrain = 0;
            for (const target of targets) {
                const damage = this.estimateDamageEnhanced(action.skill, target, skillAnalysis);
                totalDrain += damage * 0.5; // Assume 50% drain rate
            }
            
            const effectiveHeal = Math.min(totalDrain, missingHp);
            let score = effectiveHeal / this.enemy.mhp * 100;
            
            // Critical HP bonus
            if (this.enemy.hp / this.enemy.mhp < 0.3) {
                score *= 2;
            }
            
            return score;
        }
        
        // Calculate status effect score
        calculateStatusEffectScoreEnhanced(action, targets, skillAnalysis) {
            if (!targets || !skillAnalysis || !skillAnalysis.effects) return 0;
            
            let score = 0;
            const params = getPluginParams();
            
            for (const effect of skillAnalysis.effects) {
                if (effect.category === 'state_add') {
                    const stateAnalysis = this.getStateAnalysis(effect.stateId);
                    if (!stateAnalysis) continue;
                    
                    for (const target of targets) {
                        const targetTraits = this.getTraitAnalysis(target);
                        
                        // Skip if already affected
                        if (target.isStateAffected && target.isStateAffected(effect.stateId)) continue;
                        
                        // Check resistance from traits
                        if (targetTraits.stateResists.includes(effect.stateId)) continue;
                        
                        const stateRate = targetTraits.stateRates[effect.stateId] || 1.0;
                        if (stateRate <= 0) continue;
                        
                        // Base score based on state category
                        let stateScore = params.statusEffectBonus;
                        
                        switch (stateAnalysis.category) {
                            case 'disable_full':
                                stateScore += 50;
                                // Extra value for last enemy
                                if ($gameParty.aliveMembers().length === 1) {
                                    stateScore *= 2;
                                }
                                break;
                                
                            case 'disable_partial':
                                stateScore += 30;
                                break;
                                
                            case 'damage_over_time':
                                // More valuable on high HP targets
                                stateScore += (target.hp / target.mhp) * 40;
                                // Consider slip damage amount
                                if (stateAnalysis.effects.slipDamage < 0) {
                                    const dotDamage = target.mhp * Math.abs(stateAnalysis.effects.slipDamage) / 100;
                                    stateScore += dotDamage / target.mhp * 30;
                                }
                                break;
                                
                            case 'debuff':
                                // Consider which stats are debuffed
                                const debuffValue = this.calculateDebuffValue(stateAnalysis, target);
                                stateScore += debuffValue;
                                break;
                                
                            default:
                                stateScore += 10;
                                break;
                        }
                        
                        // Priority modifier based on state priority
                        stateScore *= (stateAnalysis.priority / 50);
                        
                        // Apply success chance with trait-based rate
                        stateScore *= stateRate * (effect.chance / 100);
                        
                        // Consider pharmacology trait
                        if (this.enemy.traits) {
                            const attackerTraits = this.getTraitAnalysis(this.enemy);
                            stateScore *= attackerTraits.spParams.pha || 1.0;
                        }
                        
                        // Historical success modifier
                        const successRate = this.getSkillTargetSuccessRate(skillAnalysis.id, target.name());
                        if (successRate !== null) {
                            stateScore *= successRate;
                        }
                        
                        score += stateScore;
                    }
                }
            }
            
            return score;
        }
        
        // Calculate debuff value
        calculateDebuffValue(stateAnalysis, target) {
            if (!stateAnalysis || !target) return 0;
            
            let value = 0;
            
            // Check which parameters are affected
            if (stateAnalysis.traits) {
                for (const trait of stateAnalysis.traits) {
                    if (trait.code === 21 && trait.value < 1.0) { // Param debuff
                        const reduction = 1 - trait.value;
                        const paramName = ['mhp', 'mmp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'][trait.dataId];
                        
                        switch (paramName) {
                            case 'atk':
                            case 'mat':
                                // More valuable on high damage dealers
                                const attackPower = paramName === 'atk' ? target.atk : target.mat;
                                value += attackPower * reduction / 10;
                                break;
                            case 'def':
                            case 'mdf':
                                // More valuable on tanks
                                const defense = paramName === 'def' ? target.def : target.mdf;
                                value += defense * reduction / 20;
                                break;
                            case 'agi':
                                // Speed reduction
                                value += target.agi * reduction / 15;
                                break;
                            default:
                                value += 10 * reduction;
                        }
                    }
                }
            }
            
            return value;
        }
        
        // Calculate buff/debuff score
        calculateBuffDebuffScoreEnhanced(action, targets, skillAnalysis) {
            if (!targets || !skillAnalysis || !skillAnalysis.effects) return 0;
            
            let score = 0;
            
            for (const effect of skillAnalysis.effects) {
                if (effect.category === 'buff') {
                    // Buff scoring
                    for (const target of targets) {
                        // Check current buff level
                        if (!target._buffs) continue;
                        const currentBuff = target._buffs[effect.paramId] || 0;
                        if (currentBuff >= 2) continue; // Max buff
                        
                        // Prioritize buffing high-damage dealers
                        const paramName = this.getParamName(effect.paramId);
                        let buffScore = 20;
                        
                        if (paramName === 'Attack' || paramName === 'M.Attack') {
                            const attackPower = Math.max(target.atk, target.mat);
                            buffScore += (attackPower / 100) * 15;
                        } else if (paramName === 'Defense' || paramName === 'M.Defense') {
                            // More valuable when under pressure
                            buffScore += (1 - this.battleState.allyAvgHpRatio) * 20;
                        } else if (paramName === 'Agility') {
                            // Speed is always valuable
                            buffScore += 25;
                        }
                        
                        // Extra value for buffing healthy allies
                        const hpRatio = target.hp / target.mhp;
                        buffScore *= (0.5 + hpRatio * 0.5);
                        
                        score += buffScore;
                    }
                } else if (effect.category === 'debuff') {
                    // Debuff scoring
                    for (const target of targets) {
                        const targetTraits = this.getTraitAnalysis(target);
                        
                        // Check debuff resistance
                        const debuffRate = targetTraits.debuffRates[effect.paramId] || 1.0;
                        if (debuffRate <= 0) continue;
                        
                        // Check current debuff level
                        if (!target._buffs) continue;
                        const currentDebuff = Math.abs(target._buffs[effect.paramId] || 0);
                        if (currentDebuff >= 2) continue; // Max debuff
                        
                        // Base debuff score
                        let debuffScore = 25;
                        
                        // Prioritize debuffing high-stat enemies
                        const paramName = this.getParamName(effect.paramId);
                        if (paramName === 'Attack' || paramName === 'M.Attack') {
                            const attackPower = paramName === 'Attack' ? target.atk : target.mat;
                            debuffScore += (attackPower / 100) * 20;
                        } else if (paramName === 'Defense' || paramName === 'M.Defense') {
                            // Defense debuffs more valuable when we have damage dealers
                            debuffScore += 30;
                        } else if (paramName === 'Agility') {
                            // Speed debuffs are very valuable
                            debuffScore += (target.agi / 100) * 30;
                        }
                        
                        // Apply resistance
                        debuffScore *= debuffRate;
                        
                        // Apply success chance
                        debuffScore *= (effect.chance || 100) / 100;
                        
                        score += debuffScore;
                    }
                }
            }
            
            return score;
        }
        
        // Calculate special effect score
        calculateSpecialEffectScore(action, targets, skillAnalysis) {
            if (!skillAnalysis || !skillAnalysis.effects) return 0;
            
            let score = 0;
            
            for (const effect of skillAnalysis.effects) {
                switch (effect.category) {
                    case 'special':
                        if (effect.type === 'escape') {
                            // Escape more valuable when losing
                            if (this.battleState.allyAvgHpRatio < 0.3) {
                                score += 50;
                            }
                        } else if (effect.type === 'common_event') {
                            // Unknown effect, moderate value
                            score += 15;
                        }
                        break;
                        
                    case 'grow':
                        // Permanent stat increase
                        score += 30;
                        break;
                        
                    case 'learn':
                        // Learn skill
                        score += 25;
                        break;
                        
                    default:
                        score += 10;
                }
            }
            
            return score;
        }
        
        // Calculate TP effect score
        calculateTPEffectScore(action, targets, skillAnalysis) {
            if (!targets || !skillAnalysis || !skillAnalysis.effects) return 0;
            
            let score = 0;
            
            for (const effect of skillAnalysis.effects) {
                if (effect.type === 'tp') {
                    for (const target of targets) {
                        // TP is valuable for skill-heavy allies
                        const tpNeed = (100 - target.tp) / 100;
                        score += tpNeed * 20;
                        
                        // Extra value for high-damage dealers
                        if (target.atk > this.enemy.atk || target.mat > this.enemy.mat) {
                            score += 10;
                        }
                    }
                }
            }
            
            return score;
        }
        
        // Enhanced combo checking with state preservation awareness
        checkComboOpportunitiesEnhanced(skillAnalysis, targets) {
            if (!skillAnalysis || !targets || !this.battleState) return 0;
            
            let comboScore = 0;
            const params = getPluginParams();
            
            // Check battle state combos
            for (const combo of this.battleState.comboPotential) {
                const comboTarget = targets.find(t => t.name() === combo.target);
                if (!comboTarget) continue;
                
                switch (combo.type) {
                    case 'sleep_damage':
                        if (skillAnalysis.categories.isDamage) {
                            // Consider if we should preserve the sleep state
                            const sleepState = comboTarget.states().find(s => s.restriction >= 4);
                            if (sleepState) {
                                const remainingTurns = StateAnalyzer.estimateRemainingTurns(sleepState, comboTarget);
                                
                                // Only break sleep if it's about to expire or we can secure a kill
                                const damage = this.estimateDamageEnhanced(skillAnalysis.skill, comboTarget, skillAnalysis);
                                const isLethal = damage >= comboTarget.hp;
                                
                                if (isLethal) {
                                    comboScore += 100; // High value for securing a kill
                                } else if (remainingTurns <= params.minStateValueThreshold) {
                                    comboScore += 50; // State is about to expire anyway
                                } else {
                                    comboScore -= 30; // Penalty for breaking valuable sleep early
                                }
                                
                                // Extra bonus for high damage skills when appropriate
                                if ((isLethal || remainingTurns <= 1) && 
                                    skillAnalysis.damage && skillAnalysis.damage.formula.includes('* 4')) {
                                    comboScore += 30;
                                }
                            }
                        }
                        break;
                        
                    case 'debuff_finish':
                        if (skillAnalysis.categories.isDamage) {
                            comboScore += 20 + combo.debuffCount * 5;
                        }
                        break;
                        
                    case 'dot_stack':
                        if (skillAnalysis.effects && skillAnalysis.effects.some(e => {
                            if (e.category !== 'state_add') return false;
                            const state = this.getStateAnalysis(e.stateId);
                            return state && state.category === 'damage_over_time';
                        })) {
                            comboScore += 15 + (3 - combo.currentDots) * 10;
                        }
                        break;
                        
                    case 'element_weakness':
                        if (skillAnalysis.damage && skillAnalysis.damage.elementId === combo.elementId) {
                            comboScore += combo.rate * 20;
                        }
                        break;
                }
            }
            
            // Check for skill synergies
            if (skillAnalysis.categories.hasDebuff) {
                // Debuff before damage combos
                const debuffedTargets = targets.filter(t => this.countDebuffs(t) > 0);
                if (debuffedTargets.length > 0) {
                    comboScore += debuffedTargets.length * 10;
                }
            }
            
            return comboScore;
        }
        
        // Calculate team coordination score
        calculateTeamCoordinationScore(action, targets, skillAnalysis) {
            if (!targets || !skillAnalysis) return 0;
            
            let score = 0;
            
            // Check if other allies are targeting the same enemy
            const teamDec = this.teamDecisions;
            
            if (skillAnalysis.categories.isDamage && targets.length > 0) {
                const targetName = targets[0].name();
                const alliesTargeting = teamDec.targetAssignments[targetName]?.length || 0;
                
                // Coordinate on low HP targets
                if (targets[0].hp / targets[0].mhp < 0.3) {
                    score += alliesTargeting * 10;
                }
                
                // Avoid over-targeting
                if (alliesTargeting > 2) {
                    score -= (alliesTargeting - 2) * 5;
                }
            }
            
            // Healing coordination
            if (skillAnalysis.categories.isHeal && targets.length > 0) {
                for (const target of targets) {
                    // Avoid healing already assigned targets
                    if (teamDec.healingAssigned[target.name()]) {
                        score -= 50;
                    }
                }
            }
            
            // Buff coordination
            if (skillAnalysis.categories.hasBuff) {
                // Coordinate buffs on damage dealers
                const damageDealer = $gameTroop.aliveMembers().reduce((best, ally) => {
                    const power = Math.max(ally.atk, ally.mat);
                    const bestPower = Math.max(best.atk, best.mat);
                    return power > bestPower ? ally : best;
                });
                
                if (targets.includes(damageDealer)) {
                    score += 20;
                }
            }
            
            return score;
        }
        
        // Calculate efficiency modifier
        calculateEfficiencyModifierEnhanced(action, skillAnalysis) {
            if (!action || !skillAnalysis) return 1.0;
            
            let modifier = 1.0;
            const myTraits = this.getTraitAnalysis(this.enemy);
            
            // Cost efficiency
            if (action.mpCost > 0) {
                const effectiveMpCost = action.mpCost * (myTraits.spParams.mcr || 1.0);
                const mpRatio = this.enemy.mp / this.enemy.mmp;
                
                if (mpRatio < 0.3 && effectiveMpCost > this.enemy.mmp * 0.2) {
                    modifier *= 0.5;
                } else if (mpRatio < 0.1) {
                    modifier *= 0.2;
                }
            }
            
            if (action.tpCost > 0) {
                const effectiveTpCost = action.tpCost * (myTraits.spParams.tcr || 1.0);
                const tpRatio = this.enemy.tp / 100;
                
                if (tpRatio < 0.3 && effectiveTpCost > 30) {
                    modifier *= 0.7;
                }
            }
            
            // Speed modifier - faster skills in critical situations
            if (this.battleState && this.battleState.enemyHpRatio < 0.3) {
                const effectiveSpeed = skillAnalysis.speed + (myTraits.attackSpeed || 0);
                modifier *= (200 - effectiveSpeed) / 200; // Prefer fast skills
            }
            
            // Repeat modifier - more valuable when winning
            if (skillAnalysis.repeats > 1) {
                if (this.battleState && this.battleState.allyAvgHpRatio > this.battleState.enemyAvgHpRatio) {
                    modifier *= 1.2; // Capitalize on advantage
                }
            }
            
            // Action times bonus
            if (myTraits.actionTimes > 0) {
                modifier *= 1 + (myTraits.actionTimes * 0.1);
            }
            
            // Rating modifier
            if (action.rating) {
                modifier *= (action.rating + 2) / 7;
            }
            
            // Situation modifiers
            const turn = this.battleMemory.turnCount;
            
            // Early battle
            if (turn < 3) {
                if (skillAnalysis.categories.hasStatusEffect) modifier *= 1.3;
                if (skillAnalysis.categories.hasBuff) modifier *= 1.4;
                if (skillAnalysis.categories.hasDebuff) modifier *= 1.3;
            }
            // Late battle
            else if (turn > 10) {
                if (skillAnalysis.categories.isDamage) modifier *= 1.2;
                if (skillAnalysis.categories.hasStatusEffect && !skillAnalysis.categories.isDamage) {
                    modifier *= 0.7; // Less time for status
                }
            }
            
            return modifier;
        }
        
        // Get role-based modifier
        getRoleModifier(skillAnalysis) {
            if (!skillAnalysis) return 1.0;
            
            let modifier = 1.0;
            
            switch (this.enemyRole) {
                case 'healer':
                    if (skillAnalysis.categories.isHeal) modifier *= 1.3;
                    if (skillAnalysis.categories.hasBuff) modifier *= 1.2;
                    if (skillAnalysis.categories.isDamage) modifier *= 0.8;
                    break;
                    
                case 'dps':
                    if (skillAnalysis.categories.isDamage) modifier *= 1.3;
                    if (skillAnalysis.categories.isHeal) modifier *= 0.7;
                    break;
                    
                case 'tank':
                    if (skillAnalysis.categories.hasBuff && skillAnalysis.targeting.type === 'self') modifier *= 1.3;
                    if (skillAnalysis.categories.hasDebuff) modifier *= 1.2;
                    break;
                    
                case 'support':
                    if (skillAnalysis.categories.hasBuff) modifier *= 1.3;
                    if (skillAnalysis.categories.hasDebuff) modifier *= 1.2;
                    if (skillAnalysis.categories.isDamage) modifier *= 0.8;
                    break;
                    
                case 'controller':
                    if (skillAnalysis.categories.hasStatusEffect) modifier *= 1.4;
                    if (skillAnalysis.categories.hasDebuff) modifier *= 1.2;
                    break;
            }
            
            return modifier;
        }
        
        // Get team decisions for coordination
        getTeamDecisions() {
            if (!$gameTemp._enemyTeamDecisions) {
                $gameTemp._enemyTeamDecisions = {
                    healingAssigned: {},
                    targetAssignments: {},
                    expectedDamage: {},
                    turnOrder: [],
                    sharedKnowledge: {}
                };
            }
            return $gameTemp._enemyTeamDecisions;
        }
        
        // Register this enemy's decision
        registerDecision(decision) {
            if (!decision) return;
            
            const teamDec = this.teamDecisions;
            
            // Register healing assignments
            if (decision.isHealing) {
                teamDec.healingAssigned[decision.target] = true;
            }
            
            // Register damage expectations
            if (decision.expectedDamage > 0) {
                const targetKey = decision.target;
                if (!teamDec.expectedDamage[targetKey]) {
                    teamDec.expectedDamage[targetKey] = 0;
                }
                teamDec.expectedDamage[targetKey] += decision.expectedDamage;
            }
            
            // Register target assignments
            if (decision.target) {
                if (!teamDec.targetAssignments[decision.target]) {
                    teamDec.targetAssignments[decision.target] = [];
                }
                teamDec.targetAssignments[decision.target].push(this.enemy.name());
            }
            
            // Share knowledge in Masochist mode
            if (this.difficultyBehavior.sharedKnowledge) {
                this.shareKnowledge();
            }
        }
        
        // Share knowledge between enemies
        shareKnowledge() {
            const shared = this.teamDecisions.sharedKnowledge;
            
            // Share elemental discoveries
            for (const [key, data] of Object.entries(this.battleMemory.elementalData)) {
                if (!shared.elementalData) shared.elementalData = {};
                shared.elementalData[key] = data;
            }
            
            // Share state resistances
            for (const [key, data] of Object.entries(this.battleMemory.stateResistance)) {
                if (!shared.stateResistance) shared.stateResistance = {};
                shared.stateResistance[key] = data;
            }
            
            // Share target capabilities
            for (const [key, data] of Object.entries(this.battleMemory.targetCapabilities)) {
                if (!shared.targetCapabilities) shared.targetCapabilities = {};
                shared.targetCapabilities[key] = data;
            }
            
            // Share trait analyses
            for (const [key, data] of Object.entries(this.traitAnalysisCache)) {
                if (!shared.traitAnalyses) shared.traitAnalyses = {};
                shared.traitAnalyses[key] = data;
            }
        }
        
        // Update memory after action
        updateMemory(skillId, target, success, damage = 0) {
            if (!target) return;
            
            // Update skill history
            if (!this.battleMemory.skillHistory[skillId]) {
                this.battleMemory.skillHistory[skillId] = {
                    uses: 0,
                    successes: 0,
                    totalDamage: 0
                };
            }
            
            const history = this.battleMemory.skillHistory[skillId];
            history.uses++;
            if (success) history.successes++;
            if (damage > 0) history.totalDamage += damage;
            
            // Update skill-target history
            const targetKey = `${skillId}_${target.name()}`;
            if (!this.battleMemory.skillTargetHistory[targetKey]) {
                this.battleMemory.skillTargetHistory[targetKey] = {
                    attempts: 0,
                    successes: 0
                };
            }
            
            const targetHistory = this.battleMemory.skillTargetHistory[targetKey];
            targetHistory.attempts++;
            if (success) targetHistory.successes++;
            
            // Update target capabilities
            if (!this.battleMemory.targetCapabilities[target.name()]) {
                this.battleMemory.targetCapabilities[target.name()] = {
                    observedSkills: [],
                    canHeal: false,
                    canRevive: false,
                    hasAOE: false,
                    hasStatus: false,
                    maxDamageObserved: 0
                };
            }
        }
        
        // Get a random valid skill
        getRandomValidSkill(includeBasicAttack = false) {
            if (!this.enemy || !this.enemy.enemy) return 1;
            
            const validActions = [];
            const atkId = (this.enemy.attackSkillId && typeof this.enemy.attackSkillId === 'function')
                ? this.enemy.attackSkillId()
                : 1;
            
            const enemyActions = this.enemy.enemy().actions || [];
            for (const action of enemyActions) {
                if (this.enemy.isActionValid && this.enemy.isActionValid(action)) {
                    const skill = $dataSkills[action.skillId];
                    if (skill && this.canUseSkill(skill)) {
                        if (!includeBasicAttack && skill.id === atkId) {
                            continue;
                        }
                        const rating = action.rating || 5;
                        for (let i = 0; i < rating; i++) {
                            validActions.push(skill);
                        }
                    }
                }
            }
            
            if (validActions.length > 0) {
                const randomSkill = validActions[Math.floor(Math.random() * validActions.length)];
                return randomSkill.id;
            }
            
            // Try any skill
            const allSkills = [];
            for (const action of enemyActions) {
                const skill = $dataSkills[action.skillId];
                if (skill && (!includeBasicAttack || skill.id !== atkId)) {
                    const rating = action.rating || 5;
                    for (let i = 0; i < rating; i++) {
                        allSkills.push(skill.id);
                    }
                }
            }
            
            if (allSkills.length > 0) {
                const randomId = allSkills[Math.floor(Math.random() * allSkills.length)];
                return randomId;
            }
            
            return atkId;
        }
        
        // Main decision-making method with state preservation logic
        makeDecision() {
            // Clear caches periodically to prevent memory leaks
            this.clearCaches();
            
            this.analyzeBattleState();
            
            const availableActions = this.getAllAvailableActions();
            const evaluations = [];
            
            const params = getPluginParams();
            if (params.debugMode) {
                console.log(`=== ${this.enemy.name()} AI Decision (v4.1.1) ===`);
                console.log('Battle State:', this.battleState);
                console.log('Available Actions:', availableActions.length);
                console.log('Difficulty Mode:', params.difficultyMode);
                console.log('Enemy Traits:', this.getTraitAnalysis(this.enemy));
            }
            
            // Handle no available actions
            if (availableActions.length === 0) {
                const atkSkillId = (this.enemy.attackSkillId && typeof this.enemy.attackSkillId === 'function')
                    ? this.enemy.attackSkillId()
                    : 1;
                return {
                    skillId: atkSkillId,
                    targets: [$gameParty.randomTarget() || $gameParty.members()[0]]
                };
            }
            
            // Evaluate each possible action
            for (const action of availableActions) {
                const evaluation = this.evaluateAction(action);
                evaluations.push(evaluation);
                
                if (params.debugMode) {
                    console.log(`\nAction: ${action.skill.name}`);
                    console.log(`  Scores: S:${evaluation.survivalScore.toFixed(1)} D:${evaluation.damageScore.toFixed(1)} ` +
                               `Sup:${evaluation.supportScore.toFixed(1)} T:${evaluation.tacticalScore.toFixed(1)} ` +
                               `SP:${evaluation.statePreservationScore.toFixed(1)}`);
                    console.log(`  Total: ${evaluation.totalScore.toFixed(2)}`);
                    if (evaluation.targets && evaluation.targets.length > 0) {
                        console.log(`  Targets: ${evaluation.targets.map(t => t.name()).join(', ')}`);
                    }
                }
            }
            
            // Sort by total score
            evaluations.sort((a, b) => b.totalScore - a.totalScore);
            
            // Check if top choice would break valuable states
            if (evaluations.length > 0 && evaluations[0].statePreservationScore < -50) {
                // Look for high-scoring non-damaging alternatives
                const nonDamagingEvals = evaluations.filter(e => 
                    !e.skillAnalysis.categories.isDamage && e.totalScore > evaluations[0].totalScore * 0.7
                );
                
                if (nonDamagingEvals.length > 0 && params.debugMode) {
                    console.log(`\nConsidering non-damaging alternative to preserve states...`);
                    const alternative = nonDamagingEvals[0];
                    console.log(`Alternative: ${alternative.action.skill.name} (Score: ${alternative.totalScore.toFixed(2)})`);
                    
                    // Use alternative if it's reasonably good
                    if (alternative.totalScore > evaluations[0].totalScore * 0.8) {
                        evaluations.unshift(alternative);
                    }
                }
            }
            
            // Story mode mistake chance
            if (this.difficultyBehavior.mistakeChance > 0 && Math.random() < this.difficultyBehavior.mistakeChance) {
                const suboptimalIndex = Math.floor(Math.random() * Math.min(3, evaluations.length));
                if (evaluations[suboptimalIndex] && evaluations[suboptimalIndex].totalScore > 0) {
                    const mistakeEval = evaluations[suboptimalIndex];
                    if (params.debugMode) {
                        console.log(`\nStory Mode Mistake: Choosing suboptimal action ${mistakeEval.action.skill.name}`);
                    }
                    return {
                        skillId: mistakeEval.action.skillId,
                        targets: mistakeEval.targets
                    };
                }
            }
            
            // Handle no valid evaluations
            if (evaluations.length === 0 || evaluations[0].totalScore <= 0) {
                const randomSkillId = this.getRandomValidSkill();
                const randomSkill = $dataSkills[randomSkillId];
                const fallbackId = (this.enemy.attackSkillId && typeof this.enemy.attackSkillId === 'function')
                    ? this.enemy.attackSkillId()
                    : 1;
                if (randomSkill && randomSkillId !== fallbackId) {
                    const skillAnalysis = this.getSkillAnalysis(randomSkillId);
                    const targets = this.getPotentialTargetsEnhanced(randomSkill, skillAnalysis);
                    return {
                        skillId: randomSkillId,
                        targets: targets.length > 0 ? targets : [$gameParty.randomTarget() || $gameParty.members()[0]]
                    };
                }
                return {
                    skillId: fallbackId,
                    targets: [$gameParty.randomTarget() || $gameParty.members()[0]]
                };
            }
            
            // Select best action
            const bestEval = evaluations[0];
            
            if (params.debugMode) {
                console.log(`\nSelected: ${bestEval.action.skill.name} (Score: ${bestEval.totalScore.toFixed(2)})`);
                if (bestEval.statePreservationScore < 0) {
                    console.log(`  Warning: May remove valuable states (Preservation score: ${bestEval.statePreservationScore.toFixed(1)})`);
                }
            }
            
            // Register decision
            const decision = {
                skillId: bestEval.action.skillId,
                targets: bestEval.targets,
                isHealing: bestEval.action.skill && this.getSkillAnalysis(bestEval.action.skillId).categories.isHeal,
                expectedDamage: bestEval.targets && bestEval.targets.length > 0 ? 
                    this.estimateDamageEnhanced(bestEval.action.skill, bestEval.targets[0], this.getSkillAnalysis(bestEval.action.skillId)) : 0,
                target: bestEval.targets && bestEval.targets.length > 0 ? bestEval.targets[0].name() : null
            };
            
            this.registerDecision(decision);
            
            return {
                skillId: bestEval.action.skillId,
                targets: bestEval.targets
            };
        }
    }
    
    // Override enemy action selection
    const _Game_Enemy_selectAllActions = Game_Enemy.prototype.selectAllActions;
    Game_Enemy.prototype.selectAllActions = function(actionList) {
        if (!this.isConfused || !this.isConfused()) {
            try {
                const aiEngine = new AIDecisionEngine(this);
                const decision = aiEngine.makeDecision();
                
                // Verify skill can still be used
                const skill = $dataSkills[decision.skillId];
                let canUse = skill && aiEngine.canUseSkill(skill);
                let hasValidTarget = true;
                
                if (canUse && skill) {
                    const skillAnalysis = aiEngine.getSkillAnalysis(skill.id);
                    if (!skillAnalysis || !decision.targets || decision.targets.length === 0) {
                        hasValidTarget = false;
                    }
                }
                
                if (canUse && hasValidTarget) {
                    // Clear existing actions first
                    this.clearActions();
                    
                    for (let i = 0; i < this.numActions(); i++) {
                        const action = new Game_Action(this);
                        action.setSkill(decision.skillId);
                        
                        // Set targets
                        if (decision.targets && decision.targets.length > 0) {
                            const target = decision.targets[0];
                            if (target.isActor && target.isActor()) {
                                action.setTarget(target.index());
                            } else {
                                const enemyIndex = $gameTroop.members().indexOf(target);
                                if (enemyIndex >= 0) {
                                    action.setTarget(enemyIndex);
                                }
                            }
                        }
                        
                        // Add the action
                        this._actions.push(action);
                    }
                    return; // Exit early - we've set up our actions
                }
            } catch (error) {
                const params = getPluginParams();
                if (params.debugMode) {
                    console.error('AI Decision Error:', error);
                }
            }
        }
        
        // Fallback to default behavior
        _Game_Enemy_selectAllActions.call(this, actionList);
    };
    
    // Hook into action execution to track results
    const _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        const subject = this.subject();
        const skill = this.item();
        const beforeHp = target ? target.hp : 0;
        const beforeStates = target && target._states ? target._states.slice() : [];
        
        _Game_Action_apply.call(this, target);
        
        if (!subject || !target || !skill) return;
        
        // Track player actions for profiling
        if (subject.isActor && subject.isActor()) {
            PlayerProfiler.updateProfile(this, subject, target, {
                damage: beforeHp - target.hp,
                statesChanged: target._states && target._states.length !== beforeStates.length
            });
            
            // Track skill sequence
            if (!subject._lastBattleSkillId) {
                subject._lastBattleSkillId = skill.id;
            } else {
                const profile = $globalAIMemory.playerProfile;
                const lastSkillData = profile.skillUsage[subject._lastBattleSkillId];
                if (lastSkillData) {
                    if (!lastSkillData.commonFollowUps[skill.id]) {
                        lastSkillData.commonFollowUps[skill.id] = 0;
                    }
                    lastSkillData.commonFollowUps[skill.id]++;
                }
                subject._lastBattleSkillId = skill.id;
            }
        }
        
        // Track observed skills from actors
        if (subject.isActor && subject.isActor() && $gameTemp._enemyAIMemory) {
            for (const enemyId in $gameTemp._enemyAIMemory) {
                const memory = $gameTemp._enemyAIMemory[enemyId];
                if (!memory.targetCapabilities) continue;
                
                if (!memory.targetCapabilities[subject.name()]) {
                    memory.targetCapabilities[subject.name()] = {
                        observedSkills: [],
                        canHeal: false,
                        canRevive: false,
                        hasAOE: false,
                        hasStatus: false,
                        maxDamageObserved: 0
                    };
                }
                
                const caps = memory.targetCapabilities[subject.name()];
                
                const subjAtkId = (subject.attackSkillId && typeof subject.attackSkillId === 'function')
                    ? subject.attackSkillId()
                    : 1;
                if (skill.id !== subjAtkId && !caps.observedSkills.includes(skill.id)) {
                    caps.observedSkills.push(skill.id);
                }
                
                // Update capabilities
                if (skill.damage && skill.damage.type < 0) caps.canHeal = true;
                if (skill.effects && skill.effects.some(e => e.code === 22 && e.dataId === 1)) caps.canRevive = true;
                if (skill.scope >= 2 && skill.scope <= 6) caps.hasAOE = true;
                if (skill.effects && skill.effects.some(e => e.code === 21)) caps.hasStatus = true;
                
                const damage = beforeHp - target.hp;
                if (damage > 0 && damage > caps.maxDamageObserved) {
                    caps.maxDamageObserved = damage;
                }
            }
        }
    };
    
    // Track damage and states for learning
    const _Game_Action_executeHpDamage = Game_Action.prototype.executeHpDamage;
    Game_Action.prototype.executeHpDamage = function(target, value) {
        const beforeHp = target ? target.hp : 0;
        const beforeStates = target && target._states ? target._states.slice() : [];
        
        _Game_Action_executeHpDamage.call(this, target, value);
        
        if (!target) return;
        
        // Track for AI learning
        const subject = this.subject();
        const skill = this.item();
        
        if (subject && subject.isEnemy && subject.isEnemy() && $gameTemp._enemyAIMemory) {
            const memory = $gameTemp._enemyAIMemory[subject.index()];
            if (memory) {
                const damage = beforeHp - target.hp;
                const success = damage !== 0 || (target._states && target._states.length !== beforeStates.length);
                
                // Update memory
                const aiEngine = new AIDecisionEngine(subject);
                aiEngine.battleMemory = memory;
                aiEngine.updateMemory(skill.id, target, success, Math.abs(damage));
                
                // Track strategic adaptation
                if (aiEngine.strategicAdaptation) {
                    const wasHealed = target.hp > (beforeHp - damage);
                    aiEngine.strategicAdaptation.trackCombatPattern(target, Math.abs(damage), wasHealed);
                }
                
                // Track damage patterns
                const damageKey = `${target.name()}_damage`;
                if (!memory.targetDamageHistory[damageKey]) {
                    memory.targetDamageHistory[damageKey] = {
                        attempts: 0,
                        totalDamage: 0,
                        maxDamage: 0,
                        minDamage: 999999,
                        avgDamage: 0
                    };
                }
                
                const dmgHistory = memory.targetDamageHistory[damageKey];
                dmgHistory.attempts++;
                dmgHistory.totalDamage += Math.abs(damage);
                dmgHistory.maxDamage = Math.max(dmgHistory.maxDamage, Math.abs(damage));
                dmgHistory.minDamage = Math.min(dmgHistory.minDamage, Math.abs(damage));
                dmgHistory.avgDamage = dmgHistory.totalDamage / dmgHistory.attempts;
                
                // Track state resistance
                if (skill.effects) {
                    for (const effect of skill.effects) {
                        if (effect.code === 21) { // Add state
                            const stateId = effect.dataId;
                            const resistanceKey = `${target.name()}_state_${stateId}`;
                            
                            if (!memory.stateResistance[resistanceKey]) {
                                memory.stateResistance[resistanceKey] = {
                                    attempts: 0,
                                    successes: 0
                                };
                            }
                            
                            memory.stateResistance[resistanceKey].attempts++;
                            
                            if (target.isStateAffected && target.isStateAffected(stateId)) {
                                memory.stateResistance[resistanceKey].successes++;
                            }
                        }
                    }
                }
                
                // Track elemental effectiveness with instant learning
                if (skill.damage && skill.damage.elementId > 0) {
                    const elementKey = `${target.name()}_element_${skill.damage.elementId}`;
                    const elementRate = target.elementRate ? target.elementRate(skill.damage.elementId) : 1;
                    
                    memory.elementalData[elementKey] = {
                        rate: elementRate,
                        discovered: true,
                        lastDamage: damage
                    };
                    
                    // Share to global memory if enabled
                    const params = getPluginParams();
                    if (getDifficultyBehavior(params.difficultyMode).sharedKnowledge) {
                        $globalAIMemory.knownWeaknesses[elementKey] = elementRate;
                    }
                }
            }
        }
    };
    
    // Track item usage
    const _Game_Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
    Game_Action.prototype.applyItemUserEffect = function(target) {
        _Game_Action_applyItemUserEffect.call(this, target);
        
        const params = getPluginParams();
        if (params.itemTrackingEnabled && this.isItem && this.isItem() && 
            this.subject() && this.subject().isActor && this.subject().isActor()) {
            const item = this.item();
            const actorName = this.subject().name();
            
            // Track in battle memory
            if ($gameTemp._enemyAIMemory) {
                for (const enemyId in $gameTemp._enemyAIMemory) {
                    const memory = $gameTemp._enemyAIMemory[enemyId];
                    if (!memory.observedItems[actorName]) {
                        memory.observedItems[actorName] = {};
                    }
                    
                    // Categorize item
                    let category = 'other';
                    if (item.damage && item.damage.type >= 3) category = 'healing';
                    if (item.effects && item.effects.some(e => e.code === 22 && e.dataId === 1)) category = 'revival';
                    if (item.effects && item.effects.some(e => e.code === 22)) category = 'status_cure';
                    
                    if (!memory.observedItems[actorName][category]) {
                        memory.observedItems[actorName][category] = 0;
                    }
                    memory.observedItems[actorName][category]++;
                }
            }
            
            // Track in global profile
            if (!$globalAIMemory.playerProfile.itemUsage[item.id]) {
                $globalAIMemory.playerProfile.itemUsage[item.id] = 0;
            }
            $globalAIMemory.playerProfile.itemUsage[item.id]++;
            
            // Track item quantities
            const quantity = ItemQuantityTracker.getItemQuantity(item);
            $globalAIMemory.playerProfile.itemQuantities[item.id] = quantity - 1;
        }
    };
    
    // Clear battle memory at battle start
    const _BattleManager_setup = BattleManager.setup;
    BattleManager.setup = function(troopId, canEscape, canLose) {
        _BattleManager_setup.call(this, troopId, canEscape, canLose);
        
        const params = getPluginParams();
        
        // Only clear if not persistent
        if (!getDifficultyBehavior(params.difficultyMode).persistentMemory) {
            $gameTemp._enemyAIMemory = {};
        } else {
            // Preserve some data between battles
            if (!$gameTemp._enemyAIMemory) {
                $gameTemp._enemyAIMemory = {};
            }
        }
        
        $gameTemp._enemyTeamDecisions = {
            healingAssigned: {},
            targetAssignments: {},
            expectedDamage: {},
            turnOrder: [],
            sharedKnowledge: {}
        };
        
        // Initialize memory for all enemies
        for (let i = 0; i < $gameTroop.members().length; i++) {
            if (!$gameTemp._enemyAIMemory[i]) {
                $gameTemp._enemyAIMemory[i] = {
                    skillHistory: {},
                    skillTargetHistory: {},
                    targetHistory: {},
                    targetDamageHistory: {},
                    elementalData: {},
                    stateResistance: {},
                    targetCapabilities: {},
                    turnCount: 0,
                    observedItems: {},
                    stateApplicationHistory: {}
                };
            }
            
            const enemy = $gameTroop.members()[i];
            if (enemy) {
                const aiEngine = new AIDecisionEngine(enemy);
                aiEngine.strategicAdaptation.reset();
            }
            
            // Load global knowledge if Masochist mode
            if (params.difficultyMode === 2) {
                const memory = $gameTemp._enemyAIMemory[i];
                // Copy known weaknesses
                Object.assign(memory.elementalData, $globalAIMemory.knownWeaknesses);
                // Copy known resistances
                Object.assign(memory.stateResistance, $globalAIMemory.knownResistances);
            }
        }
    };
    
    // Update turn count
    const _BattleManager_endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function() {
        _BattleManager_endTurn.call(this);
        
        if ($gameTemp._enemyAIMemory) {
            for (const memory of Object.values($gameTemp._enemyAIMemory)) {
                if (memory) {
                    memory.turnCount = (memory.turnCount || 0) + 1;
                }
            }
        }
    };
    
    // Plugin commands
    PluginManager.registerCommand(pluginName, 'changeDifficulty', args => {
        const newMode = Number(args.difficultyMode);
        if (newMode >= 0 && newMode <= 2) {
            $gameSystem._aiDifficultyMode = newMode;
            console.log(`AI Difficulty changed to: ${['Story', 'Adaptive', 'Masochist'][newMode]} Mode`);
        }
    });
    
    PluginManager.registerCommand(pluginName, 'setAdaptiveDifficulty', args => {
        const value = Number(args.value);
        const params = getPluginParams();
        const range = params.adaptiveRange;
        $gameVariables.setValue(9999, Math.max(range[0], Math.min(range[1], value)));
        console.log(`Adaptive difficulty set to: ${value}`);
    });
    
    PluginManager.registerCommand(pluginName, 'resetAIMemory', args => {
        $gameTemp._enemyAIMemory = {};
        $gameTemp._enemyTeamDecisions = {
            healingAssigned: {},
            targetAssignments: {},
            expectedDamage: {},
            turnOrder: [],
            sharedKnowledge: {}
        };
        $globalAIMemory = {
            knownWeaknesses: {},
            knownResistances: {},
            knownEquipment: {},
            playerProfile: {
                healingUsage: {},
                itemUsage: {},
                skillUsage: {},
                turnPatterns: [],
                lastActions: [],
                itemQuantities: {}
            }
        };
        console.log('AI Memory has been reset');
    });
    
    PluginManager.registerCommand(pluginName, 'toggleDebugMode', args => {
        $gameSystem._aiDebugMode = !$gameSystem._aiDebugMode;
        console.log(`AI Debug Mode: ${$gameSystem._aiDebugMode ? 'ON' : 'OFF'}`);
    });
    
})();