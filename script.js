const state = {
    selfCare: {
        regulation: { value: 0, interacted: false, locked: true },
        flexibility: { value: 0, interacted: false, locked: true }
    },
    lifeAreas: { 
        mental: { value: 0, locked: true, interacted: false, visible: false },
        spiritual: { value: 0, locked: true, interacted: false, visible: false },
        somaticBody: { value: 0, locked: true, interacted: false, visible: false }, 
        emotional: { value: 0, locked: true, interacted: false, visible: false },
        homeImprovement: { value: 0, locked: true, interacted: false, visible: false },
        workMoney: { value: 0, locked: true, interacted: false, visible: false },
        moneyHandling: { value: 0, locked: true, interacted: false, visible: false },
        housingComforts: { value: 0, locked: true, interacted: false, visible: false }, 
        freedomLevel: { value: 0, locked: true, interacted: false, visible: false }
    },
    ambient: [
        { id: Date.now(), value: 0, type: 'regulated', note: '', locked: false }
    ],
    entries: [],
    saveError: '',
    section1Expanded: false,
    section2DescExpanded: false,
    section2DescText: localStorage.getItem('offload_section2_desc') || `Three types of internal responses:

THREAT RESPONSE (DYSREGULATED): Fear, anxiety, activated feel, anger, hopelessness, powerlessness, and threat of pain responses

GROUNDED, CALM, AND APPROACHABLE (REGULATED): Present-moment awareness, body connection, gentle contentment, stable calm

OPPORTUNITY RESPONSES: Enthusiasm, joy, sex, hunger, expansiveness or freedom feelings

---

You can add more detailed descriptions here. This text will be saved automatically.`
};

function toggleSection2Desc() {
    state.section2DescExpanded = !state.section2DescExpanded;
    render();
}

function toggleSection1() {
    state.section1Expanded = !state.section1Expanded;
    render();
}

function updateSection2Desc(text) {
    state.section2DescText = text;
    localStorage.setItem('offload_section2_desc', text);
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function getLifeAreaDisplayValue(internalValue) {
    // Convert internal -7 to +7 scale to display labels
    if (internalValue === 0) return '00';
    if (internalValue === -1) return '+0';
    if (internalValue === 1) return '-0';
    if (internalValue < -1) return '+' + Math.abs(internalValue + 1); // -7 to -2 becomes +5 to +1
    if (internalValue > 1) return '-' + (internalValue - 1); // +7 to +2 becomes -5 to -1
    return '00';
}

function getSliderColor(value) {
    // Value comes in negated for display
    if (value > 0) {
        // Green gradient: lighter at +1, darker at +5 (energizing)
        const intensity = value / 5; // 0.2 to 1.0
        const red = Math.round(100 - (100 * intensity)); // 100 to 0
        const green = Math.round(220 + (35 * intensity)); // 220 to 255
        const blue = Math.round(100 - (100 * intensity)); // 100 to 0
        return `rgb(${red}, ${green}, ${blue})`;
    } else if (value < 0) {
        const absValue = Math.abs(value);
        if (absValue <= 1.5) {
            // Transition from blue to yellow/orange (0 to -1.5)
            const intensity = absValue / 1.5; // 0 to 1
            const red = Math.round(68 + (200 * intensity)); // 68 to 268 -> capped at 255
            const green = Math.round(136 + (100 * intensity)); // 136 to 236
            const blue = Math.round(255 - (155 * intensity)); // 255 to 100
            return `rgb(${Math.min(red, 255)}, ${Math.min(green, 255)}, ${blue})`;
        } else {
            // Yellow/orange to red gradient (-1.5 to -5)
            const intensity = (absValue - 1.5) / 3.5; // 0 to 1
            const red = 255; // Stay at max red
            const green = Math.round(236 - (136 * intensity)); // 236 to 100
            const blue = Math.round(100 - (100 * intensity)); // 100 to 0
            return `rgb(${red}, ${green}, ${blue})`;
        }
    } else {
        return 'rgb(68, 136, 255)'; // Blue for 0
    }
}

function getSelfCareSliderGradient() {
    // Blue on positive side, gray in middle, yellow-orange-red on negative side
    return 'linear-gradient(to right, #4488ff 0%, #bbdefb 30%, #d3d3d3 50%, #ffeb3b 65%, #ff9800 82.5%, #f44336 100%)';
}

function toggleLifeAreaLock(key) {
    state.lifeAreas[key].locked = !state.lifeAreas[key].locked;
    render();
}

function toggleLifeAreaVisible(key) {
    state.lifeAreas[key].visible = !state.lifeAreas[key].visible;
    render();
}

function toggleSelfCareLock(key) {
    state.selfCare[key].locked = !state.selfCare[key].locked;
    render();
}

function addAmbientSlider() {
    if (state.ambient.length >= 6) return;
    state.ambient.push({
        id: Date.now(),
        value: 0,
        type: 'regulated',
        note: '',
        locked: false
    });
    render();
}

function toggleAmbientLock(id) {
    const amb = state.ambient.find(a => a.id === id);
    if (amb) {
        amb.locked = !amb.locked;
        render();
    }
}

function deleteAmbientSlider(id) {
    if (state.ambient.length <= 1) {
        alert('Must keep at least one internal experience slider');
        return;
    }
    if (confirm('Delete this internal experience?')) {
        state.ambient = state.ambient.filter(a => a.id !== id);
        render();
    }
}

function getAmbientSliderGradient(type, value) {
    // Returns a CSS gradient based on the type and value
    if (type === 'threat') {
        // Yellow → Orange → Red (0 to 10)
        return 'linear-gradient(to right, #ffeb3b 0%, #ff9800 50%, #f44336 100%)';
    } else if (type === 'regulated') {
        // Light blue → Deep blue (0 to 10)
        return 'linear-gradient(to right, #bbdefb 0%, #1976d2 100%)';
    } else if (type === 'opportunity') {
        // Light hazy green → Green → Yellow (0 to 10)
        return 'linear-gradient(to right, #c8e6c9 0%, #4caf50 50%, #cddc39 100%)';
    }
    return 'linear-gradient(to right, #d1d5db 0%, #d1d5db 100%)';
}

function getAmbientSliderLabel(type) {
    // Returns detailed description for slider label
    if (type === 'threat') {
        return 'Threat Response (Dysregulated): Fear, anxiety, activated feel, anger, hopelessness, powerlessness';
    } else if (type === 'regulated') {
        return 'Grounded, calm, and approachable (Regulated): Present-moment awareness, body connection, contentment';
    } else if (type === 'opportunity') {
        return 'Opportunity Responses: Enthusiasm, joy, sex, hunger, expansiveness or freedom feelings';
    }
    return 'Intensity/Loudness';
}

function getTotal() {
    let lifeTotal = 0;
    let lifeRegulatedContribution = 0;
    
    // Process self-care sliders - positive = regulated, negative = threat
    Object.values(state.selfCare).forEach(slider => {
        if (!slider.interacted) return;
        
        const val = slider.value;
        if (val === 0) {
            // 00 (true center) = 0 contribution
        } else if (val === -1 || val === 1) {
            // 0 (one step either way) adds +1 to regulated
            lifeRegulatedContribution += 1;
        } else if (val > 1) {
            // Positive side: regulated contribution
            const actualValue = val - 1; // +2 to +7 becomes 1 to 6
            lifeRegulatedContribution += actualValue;
        } else if (val < -1) {
            // Negative side: threat contribution
            const actualValue = -(Math.abs(val) - 1); // -2 to -7 becomes -1 to -6
            lifeTotal += actualValue;
        }
    });
    
    // Process life areas with new scale - only if interacted
    Object.values(state.lifeAreas).forEach((area, index) => {
        if (!area.interacted) return; // Skip non-interacted sliders
        
        // Get the key for this area to check if it's housingComforts
        const areaKey = Object.keys(state.lifeAreas)[index];
        const isHousingComforts = areaKey === 'housingComforts';
        
        const val = area.value;
        
        if (isHousingComforts) {
            // housingComforts works like selfCare: positive = regulated, negative = threat
            if (val === 0) {
                // 00 (true center) = 0 contribution
            } else if (val === -1 || val === 1) {
                // 0 (one step either way) adds +1 to regulated
                lifeRegulatedContribution += 1;
            } else if (val > 1) {
                // Positive side: regulated contribution
                const actualValue = val - 1;
                lifeRegulatedContribution += actualValue;
            } else if (val < -1) {
                // Negative side: threat contribution
                const actualValue = -(Math.abs(val) - 1);
                lifeTotal += actualValue;
            }
        } else {
            // All other life areas use opportunity/threat model
            if (val === 0) {
                // 00 (true center) = 0 contribution (neutral/inactive)
            } else if (val === -1 || val === 1) {
                // 0 (one step either way) adds +1 to regulated
                lifeRegulatedContribution += 1;
            } else if (val < -1) {
                // Opportunity side: -7 to -2 becomes actual values +5 to +1
                const actualValue = Math.abs(val + 1);
                lifeTotal += actualValue; // Positive contribution (opportunity)
            } else if (val > 1) {
                // Threat side: +7 to +2 becomes actual values -5 to -1
                const actualValue = -(val - 1);
                lifeTotal += actualValue; // Negative contribution (threat)
            }
        }
    });
    
    // Calculate ambient contribution based on type
    let ambientContribution = 0;
    state.ambient.forEach(amb => {
        if (amb.value !== 0) {
            if (amb.type === 'threat') {
                ambientContribution -= amb.value;
            } else if (amb.type === 'opportunity') {
                ambientContribution += amb.value;
            } else if (amb.type === 'regulated') {
                ambientContribution += amb.value;
            }
        }
    });
    
    // Add life area regulated contribution to ambient
    ambientContribution += lifeRegulatedContribution;
    
    return lifeTotal + ambientContribution;
}

function getThreatLoad() {
    // Sum all threat values
    let threatTotal = 0;
    let selfCareThreat = 0;
    let lifeAreaThreat = 0;
    let ambientThreat = 0;
    
    // Self-care threat - only negative side
    Object.values(state.selfCare).forEach(slider => {
        if (!slider.interacted) return;
        const val = slider.value;
        if (val < -1) {
            // -2 to -7 becomes 1 to 6
            selfCareThreat += Math.abs(val) - 1;
        }
    });
    
    Object.values(state.lifeAreas).forEach((area, index) => {
        if (!area.interacted) return; // Skip non-interacted sliders
        
        const areaKey = Object.keys(state.lifeAreas)[index];
        const isHousingComforts = areaKey === 'housingComforts';
        const val = area.value;
        
        if (isHousingComforts) {
            // housingComforts: negative side = threat
            if (val < -1) {
                lifeAreaThreat += Math.abs(val) - 1;
            }
        } else {
            // Other areas: positive side = threat
            if (val > 1) {
                lifeAreaThreat += (val - 1);
            }
        }
    });
    
    // Add threat ambient experiences
    state.ambient.forEach(amb => {
        if (amb.value !== 0 && amb.type === 'threat') {
            ambientThreat += amb.value;
        }
    });
    
    threatTotal = selfCareThreat + lifeAreaThreat + ambientThreat;
    console.log('Threat Load - SelfCare:', selfCareThreat, 'Life:', lifeAreaThreat, 'Ambient:', ambientThreat, 'Total:', threatTotal);
    return threatTotal;
}

function getOpportunityLoad() {
    // Sum all opportunity values
    let opportunityTotal = 0;
    let lifeAreaOpp = 0;
    let ambientOpp = 0;
    
    // Self-care does NOT contribute to opportunity
    
    Object.values(state.lifeAreas).forEach((area, index) => {
        if (!area.interacted) return; // Skip non-interacted sliders
        
        const areaKey = Object.keys(state.lifeAreas)[index];
        const isHousingComforts = areaKey === 'housingComforts';
        const val = area.value;
        
        // housingComforts doesn't contribute to opportunity (it goes to regulated instead)
        if (!isHousingComforts && val < -1) {
            // Opportunity side: -7 to -2 becomes actual values 5 to 1
            lifeAreaOpp += Math.abs(val + 1);
        }
    });
    
    // Add opportunity ambient experiences
    state.ambient.forEach(amb => {
        if (amb.value !== 0 && amb.type === 'opportunity') {
            ambientOpp += amb.value;
        }
    });
    
    opportunityTotal = lifeAreaOpp + ambientOpp;
    console.log('Opportunity Load - Life:', lifeAreaOpp, 'Ambient:', ambientOpp, 'Total:', opportunityTotal);
    return opportunityTotal;
}

function getRegulatedLoad() {
    // Sum all regulated values (from ambient AND from life areas at 0)
    let regulatedTotal = 0;
    
    // Self-care contribution - positive side goes to regulated
    Object.values(state.selfCare).forEach(slider => {
        if (!slider.interacted) return;
        const val = slider.value;
        if (val === -1 || val === 1) {
            regulatedTotal += 1; // 0 adds +1
        } else if (val > 1) {
            // Positive side: +2 to +7 becomes 1 to 6
            regulatedTotal += (val - 1);
        }
    });
    
    // Life areas contribution - only if interacted
    Object.values(state.lifeAreas).forEach((area, index) => {
        if (!area.interacted) return; // Skip non-interacted sliders
        
        const areaKey = Object.keys(state.lifeAreas)[index];
        const isHousingComforts = areaKey === 'housingComforts';
        const val = area.value;
        
        if (isHousingComforts) {
            // housingComforts: positive side = regulated
            if (val === -1 || val === 1) {
                regulatedTotal += 1; // 0 adds +1
            } else if (val > 1) {
                regulatedTotal += (val - 1);
            }
        } else {
            // Other areas: only 0 positions contribute to regulated
            if (val === 0) {
                // 00 = 0 contribution (neutral/inactive)
            } else if (val === -1 || val === 1) {
                regulatedTotal += 1; // 0 adds +1
            }
        }
    });
    
    // Ambient contribution
    state.ambient.forEach(amb => {
        if (amb.value !== 0 && amb.type === 'regulated') {
            regulatedTotal += amb.value;
        }
    });
    
    console.log('Regulated Load:', regulatedTotal);
    return regulatedTotal;
}

function getPercentage() {
    const total = getTotal();
    // Map -30 (max load) to 100%, +10 (min load) to 0%
    // Range is 40 total: from -30 to +10
    const normalized = (-total + 10) / 40; // Convert to 0-1 range (flip sign so -30 maps to 1)
    return Math.round(Math.max(0, Math.min(100, normalized * 100)));
}

function getStatus() {
    const pct = getPercentage();
    if (pct >= 90) return { icon: '🚨', text: 'Critical load - system at capacity', color: '#fee2e2', border: '#fca5a5', textColor: '#991b1b' };
    if (pct >= 75) return { icon: '⚠️', text: 'High load - approaching capacity', color: '#fed7aa', border: '#fb923c', textColor: '#9a3412' };
    if (pct >= 50) return { icon: '⚡', text: 'Moderate load - monitoring needed', color: '#fef3c7', border: '#fcd34d', textColor: '#92400e' };
    return { icon: '✓', text: 'Expanded Tolerance - recovering or possible engagement', color: '#d1fae5', border: '#6ee7b7', textColor: '#065f46' };
}

function updateSlider(category, key, value) {
    if (category === 'selfCare') {
        if (!state.selfCare[key].locked) {
            state.selfCare[key].value = parseInt(value);
            state.selfCare[key].interacted = true;
            render();
        }
    } else if (category === 'life') {
        if (!state.lifeAreas[key].locked) {
            state.lifeAreas[key].value = parseInt(value);
            state.lifeAreas[key].interacted = true;
            render();
        }
    }
}

function updateAmbient(id, field, value) {
    const amb = state.ambient.find(a => a.id === id);
    if (!amb || amb.locked) return;
    
    if (field === 'value') {
        amb.value = parseInt(value);
    } else {
        amb[field] = value;
    }
    render();
}

function validateSave() {
    const errors = [];
    state.ambient.forEach((amb, i) => {
        if (amb.value !== 0) {
            if (!amb.type) errors.push(`Internal Activity ${i+1}: Type is required when slider is not at 0`);
            if (!amb.note.trim()) errors.push(`Internal Activity ${i+1}: Note is required when slider is not at 0`);
        }
    });
    return errors;
}

function saveEntry() {
    const errors = validateSave();
    if (errors.length > 0) {
        state.saveError = errors.join('<br>');
        render();
        return;
    }

    state.saveError = '';
    
    // Extract display values for saving
    const lifeAreasDisplay = {};
    Object.keys(state.lifeAreas).forEach(key => {
        lifeAreasDisplay[key] = getLifeAreaDisplayValue(state.lifeAreas[key].value);
    });
    
    // Calculate life total based on actual threat/opportunity contributions
    let lifeTotal = 0;
    Object.values(state.lifeAreas).forEach(area => {
        const val = area.value;
        if (val < -1) {
            lifeTotal += Math.abs(val + 1); // Opportunity
        } else if (val > 1) {
            lifeTotal -= (val - 1); // Threat
        }
        // 00 and 0 don't contribute to lifeTotal, they go to regulated
    });
    
    const threatLoad = getThreatLoad();
    const opportunityLoad = getOpportunityLoad();
    const regulatedLoad = getRegulatedLoad();
    
    const entry = {
        timestamp: new Date().toISOString(),
        lifeAreas: {...lifeAreasDisplay},
        ambient: state.ambient.map(a => ({
            value: a.value,
            type: a.type,
            note: a.note
        })),
        lifeTotal,
        total: getTotal(),
        pct: getPercentage(),
        threatLoad,
        opportunityLoad,
        regulatedLoad
    };
    
    state.entries.unshift(entry);
    
    // Send to Google Sheets
    fetch('https://script.google.com/macros/s/AKfycbyre8dXSoVH3LDvBa-SsfPjX0gpKbNcjrF7p-YLQB6fhkQQNRcxmFyoqhp-Xp45VlLU0Q/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
    }).then(() => {
        console.log('Data sent to Google Sheets');
    }).catch(error => {
        console.error('Error sending to Google Sheets:', error);
    });
    
    render();
}

function copyEntries() {
    const text = state.entries.map(e => {
        const date = new Date(e.timestamp).toLocaleString();
        const lifeAreasText = Object.entries(e.lifeAreas).map(([key, val]) => {
            const labels = {
                mental: 'Mental',
                somaticBody: 'Somatic/Body',
                emotional: 'Emotional',
                housingComforts: 'Housing/Comforts',
                workMoney: 'Work/Income',
                moneyHandling: 'Money/Resources',
                spiritual: 'Perception of Mankind',
                freedomLevel: 'Friendly Universe'
            };
            return `${labels[key]}: ${val}`;
        }).join(', ');
        
        const ambientText = e.ambient.filter(a => a.value !== 0).map((a, i) => {
            const typeLabels = {
                'threat': 'Threat Response',
                'regulated': 'Regulated/Grounded',
                'opportunity': 'Opportunity Response'
            };
            return `  [${a.value}/10, ${typeLabels[a.type]}]: ${a.note}`;
        }).join('\n');
        return `=== ${date} ===
Life Areas (Net: ${e.lifeTotal}):
${lifeAreasText}

Internal Experiences:
${ambientText || '  (none)'}

Threat Load: ${e.threatLoad || 0}
Regulated Load: ${e.regulatedLoad || 0}
Opportunity Load: ${e.opportunityLoad || 0}
Total Load: ${e.total} (${e.pct}%)\n`;
    }).join('\n');
    navigator.clipboard.writeText(text);
    alert('Entries copied!');
}

function clearEntries() {
    if (confirm('Clear all entries?')) {
        state.entries = [];
        render();
    }
}

function updateVisualization(threatLoad, opportunityLoad, regulatedLoad) {
    const visualization = document.getElementById('visualization');
    if (!visualization) return;
    
    const gateShapeTop = document.getElementById('gateShapeTop');
    const gateShapeBottom = document.getElementById('gateShapeBottom');
    const gateTextTop = document.getElementById('gateTextTop');
    const gateTextBottom = document.getElementById('gateTextBottom');
    const riverChannel = document.getElementById('riverChannel');
    const riverWater = document.getElementById('riverWater');
    const riverText = document.getElementById('riverText');
    
    const height = 300;
    const maxLoad = 50; // Max possible load on either end
    const minGateHeight = 15; // Minimum height for gates so they never fully close
    
    // Calculate raw gate heights - each can go up to 90%
    let topGateHeight = Math.max(minGateHeight, Math.min((threatLoad / maxLoad) * height * 1.8, height * 0.9));
    let bottomGateHeight = Math.max(minGateHeight, Math.min((opportunityLoad / maxLoad) * height * 1.8, height * 0.9));
    
    // Ensure combined gates never exceed 90% of total height
    const combinedHeight = topGateHeight + bottomGateHeight;
    const maxCombined = height * 0.9;
    
    if (combinedHeight > maxCombined) {
        // Scale both gates down proportionally, but keep minimum heights
        const scaleFactor = maxCombined / combinedHeight;
        topGateHeight = Math.max(minGateHeight, topGateHeight * scaleFactor);
        bottomGateHeight = Math.max(minGateHeight, bottomGateHeight * scaleFactor);
    }
    
    gateShapeTop.style.height = topGateHeight + 'px';
    gateShapeBottom.style.height = bottomGateHeight + 'px';
    
    gateTextTop.style.top = topGateHeight + 'px';
    gateTextTop.textContent = 'THREAT\n' + threatLoad;
    
    gateTextBottom.style.bottom = bottomGateHeight + 'px';
    gateTextBottom.textContent = 'OPPORTUNITY\n' + opportunityLoad;
    
    // Calculate background color based on gate positions
    // Regulated load widens the blue river space
    const availableSpace = height - topGateHeight - bottomGateHeight;
    const topGateFactor = topGateHeight / height; // 0 to 0.48
    const bottomGateFactor = bottomGateHeight / height; // 0 to 0.48
    const regulatedFactor = regulatedLoad / 30; // 0 to 1 (assuming max regulated is 30)
    
    // THREE INDEPENDENT ZONES
    // Calculate intensity factors for each zone
    const maxThreatForColor = 40;
    const maxOppForColor = 40;
    const maxRegForColor = 30;
    
    const threatIntensity = Math.min(threatLoad / maxThreatForColor, 1);
    const opportunityIntensity = Math.min(opportunityLoad / maxOppForColor, 1);
    const regulatedIntensity = Math.min(regulatedLoad / maxRegForColor, 1);
    
    // THREAT ZONE (top) - Yellow → Orange → Red
    let threatR, threatG, threatB;
    if (threatIntensity === 0) {
        // FIXED: No threat = very light yellow (was too gray before)
        threatR = 255; threatG = 253; threatB = 231;
    } else if (threatIntensity < 0.5) {
        // Yellow to Orange
        const factor = threatIntensity * 2; // 0 to 1
        threatR = 255;
        threatG = Math.round(235 - (83 * factor)); // 235 to 152
        threatB = Math.round(59 - (59 * factor)); // 59 to 0
    } else {
        // Orange to Red
        const factor = (threatIntensity - 0.5) * 2; // 0 to 1
        threatR = 255;
        threatG = Math.round(152 - (84 * factor)); // 152 to 68
        threatB = 0;
    }
    
    // RIVER ZONE (middle) - Blue scale (FIXED!)
    let riverR, riverG, riverB;
    if (regulatedIntensity === 0) {
        // FIXED: No regulated = light blue (was gray before)
        riverR = 191; riverG = 219; riverB = 254;
    } else {
        // Light blue to Deep blue
        riverR = Math.round(191 - (123 * regulatedIntensity)); // 191 to 68
        riverG = Math.round(219 - (83 * regulatedIntensity)); // 219 to 136
        riverB = 255; // FIXED: Keep blue maxed
    }
    
    // OPPORTUNITY ZONE (bottom) - Light green → Green → Yellow
    let oppR, oppG, oppB;
    if (opportunityIntensity === 0) {
        // FIXED: No opportunity = very pale green (was too gray before)
        oppR = 240; oppG = 253; oppB = 244;
    } else if (opportunityIntensity < 0.5) {
        // Light green to Green
        const factor = opportunityIntensity * 2; // 0 to 1
        oppR = Math.round(200 - (132 * factor)); // 200 to 68
        oppG = Math.round(230 - (25 * factor)); // 230 to 205
        oppB = Math.round(200 - (132 * factor)); // 200 to 68
    } else {
        // Green to Yellow-green
        const factor = (opportunityIntensity - 0.5) * 2; // 0 to 1
        oppR = Math.round(68 + (137 * factor)); // 68 to 205
        oppG = Math.round(205 + (30 * factor)); // 205 to 235
        oppB = Math.round(68 - (9 * factor)); // 68 to 59
    }
    
    // Create gradient background with three zones
    visualization.style.background = `linear-gradient(to bottom, 
        rgb(${threatR}, ${threatG}, ${threatB}) 0%, 
        rgb(${threatR}, ${threatG}, ${threatB}) ${(topGateHeight / height) * 100}%, 
        rgb(${riverR}, ${riverG}, ${riverB}) ${(topGateHeight / height) * 100}%, 
        rgb(${riverR}, ${riverG}, ${riverB}) ${((height - bottomGateHeight) / height) * 100}%, 
        rgb(${oppR}, ${oppG}, ${oppB}) ${((height - bottomGateHeight) / height) * 100}%, 
        rgb(${oppR}, ${oppG}, ${oppB}) 100%)`;
    
    // River channel flows through available space between gates
    // Regulated load makes the river wider
    const width = 600;
    const riverTop = topGateHeight;
    const riverBottom = height - bottomGateHeight;
    const riverHeight = riverBottom - riverTop;
    
    // Calculate channel width with regulated load bonus
    const spaceFactor = availableSpace / height;
    const maxChannelWidth = riverHeight * 0.95; // Max 95% of available space
    const minChannelWidth = Math.min(riverHeight * 0.3, 30); // At least 30% or 30px
    
    // Base channel width
    let channelWidth = minChannelWidth + (spaceFactor * (maxChannelWidth - minChannelWidth));
    
    // Add regulated bonus - up to 30% wider
    const regulatedBonus = regulatedFactor * (riverHeight * 0.3);
    channelWidth = Math.min(channelWidth + regulatedBonus, maxChannelWidth);
    
    const waterWidth = channelWidth * 0.85;
    
    // FIXED: River touches gate edges exactly - accounting for 2px stroke
    // Stroke is centered on path, so extends 1px outside on each side
    // Need to extend channel by 1px up and 1px down so stroke edge touches gates
    const channelTopY = riverTop - 1;  // Extend 1px up so stroke touches top gate
    const channelBottomY = riverBottom + 1;  // Extend 1px down so stroke touches bottom gate
    const actualChannelHeight = channelBottomY - channelTopY;
    
    const channelPath = `M 0,${channelTopY} L ${width},${channelTopY} L ${width},${channelBottomY} L 0,${channelBottomY} Z`;
    
    // Water centered within the full channel
    const waterTopY = channelTopY + (actualChannelHeight - waterWidth) / 2;
    const waterBottomY = waterTopY + waterWidth;
    const waterPath = `M 0,${waterTopY} L ${width},${waterTopY} L ${width},${waterBottomY} L 0,${waterBottomY} Z`;
    
    riverChannel.setAttribute('d', channelPath);
    riverWater.setAttribute('d', waterPath);
    
    // Position river text in the center of the available space between gates
    const centerY = topGateHeight + (availableSpace / 2);
    riverText.style.top = centerY + 'px';
    
    // Update text to show regulated contribution
    if (regulatedLoad > 0) {
        riverText.innerHTML = `Window of Tolerance Width<br>or Internal Information<br>Processing Capacity<br><span style="font-size: 11px; color: #bbdefb;">(+${regulatedLoad} regulated)</span>`;
    } else {
        riverText.innerHTML = 'Window of Tolerance Width<br>or Internal Information<br>Processing Capacity';
    }
    
    // Position neutral list at same vertical center
    const neutralList = document.getElementById('neutralList');
    if (neutralList) {
        neutralList.style.top = centerY + 'px';
    }
    
    // Adjust font size and letter spacing based on available vertical space
    const availablePercent = availableSpace / height;
    
    if (availablePercent < 0.3) {
        const fontSize = Math.max(8, availablePercent * 40);
        const letterSpacing = Math.max(0, (0.3 - availablePercent) * 10);
        riverText.style.fontSize = fontSize + 'px';
        riverText.style.letterSpacing = letterSpacing + 'px';
    } else {
        riverText.style.fontSize = '14px';
        riverText.style.letterSpacing = '0px';
    }
    
    // Update contributor lists
    updateContributorLists();
}

function updateContributorLists() {
    const contributorsThreat = document.getElementById('contributorsThreat');
    const contributorsOpportunity = document.getElementById('contributorsOpportunity');
    const neutralList = document.getElementById('neutralList');
    
    if (!contributorsThreat || !contributorsOpportunity || !neutralList) return;
    
    const selfCareLabels = {
        regulation: 'Recent Regulation State',
        flexibility: 'Flexibility to Disengage'
    };
    
    const lifeAreasLabels = {
        mental: 'Mental Activity',
        somaticBody: 'Somatic &/or Body',
        emotional: 'Emotional',
        homeImprovement: 'Home Improvement Efforts',
        housingComforts: 'Self Care Supports',
        workMoney: 'Work Experiences & Income Generation',
        moneyHandling: 'Money & Resource Handling',
        spiritual: 'Personal Relationships or Interactions',
        freedomLevel: 'Spiritual Level Outlook'
    };
    
    const typeLabels = {
        'threat': 'Threat Response',
        'regulated': 'Regulated/Grounded',
        'opportunity': 'Opportunity Response'
    };
    
    let threatItems = [];
    let opportunityItems = [];
    let regulatedItems = [];
    
    // Collect self-care contributors - positive = regulated, negative = threat
    Object.entries(state.selfCare).forEach(([key, slider]) => {
        if (!slider.interacted) return;
        
        const val = slider.value;
        if (val < -1) {
            // Negative side = threat
            threatItems.push({ label: selfCareLabels[key], value: Math.abs(val) - 1 });
        } else if (val === -1 || val === 1) {
            // 0 position = regulated
            regulatedItems.push({ label: selfCareLabels[key], value: 1 });
        } else if (val > 1) {
            // Positive side = regulated
            regulatedItems.push({ label: selfCareLabels[key], value: val - 1 });
        }
    });
    
    // Collect life area contributors - only if interacted
    Object.entries(state.lifeAreas).forEach(([key, area]) => {
        if (!area.interacted) return; // Skip non-interacted sliders
        
        const isHousingComforts = key === 'housingComforts';
        const val = area.value;
        
        if (isHousingComforts) {
            // housingComforts works like selfCare: positive = regulated, negative = threat
            if (val < -1) {
                threatItems.push({ label: lifeAreasLabels[key], value: Math.abs(val) - 1 });
            } else if (val === -1 || val === 1) {
                regulatedItems.push({ label: lifeAreasLabels[key], value: 1 });
            } else if (val > 1) {
                regulatedItems.push({ label: lifeAreasLabels[key], value: val - 1 });
            }
        } else {
            // Other areas use opportunity/threat model
            if (val > 1) {
                // Threat side
                threatItems.push({ label: lifeAreasLabels[key], value: val - 1 });
            } else if (val < -1) {
                // Opportunity side
                opportunityItems.push({ label: lifeAreasLabels[key], value: Math.abs(val + 1) });
            } else if (val === -1 || val === 1) {
                // 0 = +1 regulated
                regulatedItems.push({ label: lifeAreasLabels[key], value: 1 });
            }
        }
        // 00 (val === 0) contributes nothing
    });
    
    // Collect internal experience contributors
    state.ambient.forEach((amb, i) => {
        if (amb.value !== 0) {
            const typeLabel = typeLabels[amb.type] || amb.type;
            const label = `Internal Experience ${i+1} (${typeLabel})`;
            
            if (amb.type === 'threat') {
                threatItems.push({ label: label, value: amb.value });
            } else if (amb.type === 'opportunity') {
                opportunityItems.push({ label: label, value: amb.value });
            } else if (amb.type === 'regulated') {
                regulatedItems.push({ label: label, value: amb.value });
            }
        }
    });
    
    // Sort by value descending
    threatItems.sort((a, b) => b.value - a.value);
    opportunityItems.sort((a, b) => b.value - a.value);
    regulatedItems.sort((a, b) => b.value - a.value);
    
    // Render threat list
    contributorsThreat.innerHTML = threatItems.length > 0 
        ? threatItems.map(item => `<div class="contributor-item">${item.label}: ${item.value}</div>`).join('')
        : '';
    
    // Render opportunity list
    contributorsOpportunity.innerHTML = opportunityItems.length > 0
        ? opportunityItems.map(item => `<div class="contributor-item">${item.label}: ${item.value}</div>`).join('')
        : '';
    
    // Render regulated list
    let regulatedContent = '';
    if (regulatedItems.length > 0) {
        regulatedContent = '<div style="font-weight: bold; margin-bottom: 3px; color: #bbdefb;">Regulated:</div>' +
          regulatedItems.map(item => `<div class="neutral-item" style="color: #bbdefb;">• ${item.label}: ${item.value}</div>`).join('');
    }
    neutralList.innerHTML = regulatedContent;
}

function render() {
    const total = getTotal();
    const pct = getPercentage();
    const status = getStatus();
    
    // Calculate life total for display
    let lifeTotal = 0;
    Object.values(state.lifeAreas).forEach(area => {
        if (!area.interacted) return; // Skip non-interacted sliders
        
        const val = area.value;
        if (val < -1) {
            lifeTotal += Math.abs(val + 1); // Opportunity
        } else if (val > 1) {
            lifeTotal -= (val - 1); // Threat
        }
    });
    
    const threatLoad = getThreatLoad();
    const opportunityLoad = getOpportunityLoad();
    const regulatedLoad = getRegulatedLoad();

    const lifeAreasConfig = [
        { key: 'mental', label: 'Mental Activity' },
        { key: 'somaticBody', label: 'Somatic &/or Body' },
        { key: 'emotional', label: 'Emotional' },
        { key: 'homeImprovement', label: 'Home Improvement Efforts' },
        { key: 'housingComforts', label: 'Self Care Supports like enjoying creature comforts, gentle hobbies, or gentle socializing' },
        { key: 'workMoney', label: 'Work Experiences & Income Generation' },
        { key: 'moneyHandling', label: 'Money & Resource Handling' },
        { key: 'spiritual', label: 'Personal Relationships or Interactions' },
        { key: 'freedomLevel', label: 'Spiritual Level Outlook' }
    ];
    
    // Sort so visible areas come first, hidden areas at bottom
    const sortedLifeAreas = lifeAreasConfig.sort((a, b) => {
        const aVisible = state.lifeAreas[a.key].visible;
        const bVisible = state.lifeAreas[b.key].visible;
        if (aVisible === bVisible) return 0;
        return aVisible ? -1 : 1; // visible items first
    });

    const html = `
        <div class="card header">
            <h1>Offload: A nervous system validation companion</h1>
            <div class="subtitle">(Based on the concepts of Polyvagal Theory, Shadow Work, Window of Tolerance, Inner Child Work, and RAS and default mode reprogramming)<br><em style="font-size: 11px; color: #9333ea;">Saves to Google Sheets</em></div>
        </div>

        <div class="card">
            <h2>How This Works:</h2>
            <div class="how-it-works">
                <div class="how-item"><span class="how-label">Dual Gates System:</span> Top gate (red) closes down with threat load, bottom gate (green) closes up with opportunity load. Blue river flows between them showing your window of tolerance.</div>
                <div class="how-item"><span class="how-label">Life Areas (00, 0, 1-5 each):</span> Start at 00 (inactive). Unlock to adjust. 0 positions add +1 to regulated. Negative values (threat) close top gate, positive values (opportunity) close bottom gate.</div>
                <div class="how-item"><span class="how-label">Internal Experiences (0-10 each):</span> Rate intensity, then select type:
                    <ul style="margin-left: 20px; margin-top: 3px;">
                        <li><strong>Threat Response (Dysregulated):</strong> Adds to threat gate (yellow→orange→red gradient)</li>
                        <li><strong>Grounded, calm, and approachable (Regulated):</strong> Widens the blue river / window of tolerance (light blue→deep blue gradient)</li>
                        <li><strong>Opportunity Responses:</strong> Adds to opportunity gate (light green→green→yellow gradient)</li>
                    </ul>
                </div>
                <div class="how-item"><span class="how-label">Regulated State:</span> More 0 positions + regulated load = wider blue river = more capacity available</div>
            </div>
        </div>

        <div class="card" style="border-left: 4px solid #16a34a;">
            <h2>Self-Care Check-In</h2>
            <div class="subtitle" style="margin-bottom: 12px;"><em>Foundation assessment - always visible</em></div>
            
            <div class="slider-container">
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 3px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px;">
                        <div class="slider-header" style="margin-bottom: 0;">
                            <span class="slider-label" style="font-size: 13px;">How regulated or dysregulated have things been for you in the past few days?</span>
                            <span class="slider-value" style="color: ${getSliderColor(-state.selfCare.regulation.value)};">${getLifeAreaDisplayValue(state.selfCare.regulation.value)}</span>
                        </div>
                    </div>
                    <button class="btn" onclick="toggleSelfCareLock('regulation')" 
                            style="padding: 4px 8px; font-size: 11px; white-space: nowrap; ${state.selfCare.regulation.locked ? 'background: #f59e0b; color: white;' : 'background: #16a34a; color: white;'}">
                        ${state.selfCare.regulation.locked ? 'Unlock' : 'Lock'}
                    </button>
                </div>
                <div class="slider-labels">
                    <span>+5 Consistently regulated</span>
                    <span>0 Mixed</span>
                    <span>-5 Dysregulated</span>
                </div>
                <input type="range" min="-7" max="7" value="${state.selfCare.regulation.value}" 
                       onchange="updateSlider('selfCare', 'regulation', this.value)"
                       ${state.selfCare.regulation.locked ? 'disabled' : ''}
                       style="background: ${getSelfCareSliderGradient()}; ${state.selfCare.regulation.locked ? 'opacity: 0.6; cursor: not-allowed;' : ''}">
            </div>
            
            <div class="slider-container">
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 3px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px;">
                        <div class="slider-header" style="margin-bottom: 0;">
                            <span class="slider-label" style="font-size: 13px;">How much flexibility do you have to stay disengaged from "productive efforts"?</span>
                            <span class="slider-value" style="color: ${getSliderColor(-state.selfCare.flexibility.value)};">${getLifeAreaDisplayValue(state.selfCare.flexibility.value)}</span>
                        </div>
                    </div>
                    <button class="btn" onclick="toggleSelfCareLock('flexibility')" 
                            style="padding: 4px 8px; font-size: 11px; white-space: nowrap; ${state.selfCare.flexibility.locked ? 'background: #f59e0b; color: white;' : 'background: #16a34a; color: white;'}">
                        ${state.selfCare.flexibility.locked ? 'Unlock' : 'Lock'}
                    </button>
                </div>
                <div class="slider-labels">
                    <span>+5 Complete freedom</span>
                    <span>0 Some flexibility</span>
                    <span>-5 Locked in</span>
                </div>
                <input type="range" min="-7" max="7" value="${state.selfCare.flexibility.value}" 
                       onchange="updateSlider('selfCare', 'flexibility', this.value)"
                       ${state.selfCare.flexibility.locked ? 'disabled' : ''}
                       style="background: ${getSelfCareSliderGradient()}; ${state.selfCare.flexibility.locked ? 'opacity: 0.6; cursor: not-allowed;' : ''}">
            </div>
        </div>

        <div class="card section-blue">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px;">
                <h2 style="margin: 0;">1. General Scan (for if you are bored or curious)</h2>
                <button class="btn" onclick="toggleSection1()" 
                        style="padding: 6px 12px; font-size: 12px; background: #3b82f6; color: white;">
                    ${state.section1Expanded ? 'Hide ▲' : 'Expand ▼'}
                </button>
            </div>
            
            ${state.section1Expanded ? `
            <div class="meta-layer">
                <div class="meta-labels">
                    <div class="meta-label">Regulated Opportunity Responses</div>
                    <div class="meta-label">Neutral or Mixed</div>
                    <div class="meta-label">Dysregulated Threat Responses</div>
                </div>
                <div class="meta-lines">
                    <div class="meta-line meta-line-left"></div>
                    <div class="meta-line meta-line-right"></div>
                </div>
            </div>
            
            <div class="life-areas-container">
                <div class="life-areas-dividers">
                    <div class="divider-line divider-left"></div>
                    <div class="divider-line divider-right"></div>
                </div>
            
            ${sortedLifeAreas.map(({ key, label }) => {
                const area = state.lifeAreas[key];
                const isMental = key === 'mental';
                const isSomatic = key === 'somaticBody';
                const isHomeImprovement = key === 'homeImprovement';
                const isHousing = key === 'housingComforts';
                const isWorkMoney = key === 'workMoney';
                const isMoneyHandling = key === 'moneyHandling';
                const isSpiritual = key === 'spiritual';
                const isFreedomLevel = key === 'freedomLevel';
                
                let positiveLabel, neutralLabel, negativeLabel;
                
                if (isMental) {
                    positiveLabel = '+5 Creative, Pleasant, Enjoyable (beware overly fantasizing)';
                    neutralLabel = '0 Think about self compassion/forgiveness and body awareness';
                    negativeLabel = '-5 Avoidant/Racing Thoughts, Ruminating, Catastrophizing';
                } else if (isSomatic) {
                    positiveLabel = '+5 Calm, relaxed, can easily tolerate discomforts';
                    neutralLabel = '0 Able to force tolerating discomforts while resting/relaxing';
                    negativeLabel = '-5 Body aches/pains or other physical symptoms';
                } else if (isHomeImprovement) {
                    positiveLabel = '+5 Enjoying creative home projects, satisfying progress';
                    neutralLabel = '0 Neutral about home maintenance';
                    negativeLabel = '-5 Pressured by overdue repairs, overwhelming obligations';
                } else if (isHousing) {
                    positiveLabel = '+5 Enjoying restorative activities, gentle connection';
                    neutralLabel = '0 Neutral or mixed feelings about self-care';
                    negativeLabel = '-5 Avoiding rest, isolated, depleted';
                } else if (isWorkMoney) {
                    positiveLabel = '+5 A calmable enthusiasm for work/money related tasks';
                    neutralLabel = '0 Have some willingness to pursue/engage in income generating efforts';
                    negativeLabel = '-5 Intense or persistent anticipation, rumination, or pressure to perform';
                } else if (isMoneyHandling) {
                    positiveLabel = '+5 Curiosity or thinking about paying down debt or investing into business related things';
                    neutralLabel = '0 Not really thinking or worrying about money or resources at all';
                    negativeLabel = '-5 Fear about financial failure or obsessions about money monitoring';
                } else if (isSpiritual) {
                    positiveLabel = '+5 Able and willing to practice tolerance of information while interacting';
                    neutralLabel = '0 Can neutralize overly negative thoughts/narratives';
                    negativeLabel = '-5 Resentments, blaming, catastrophizing, external critic, and prolonged avoidance';
                } else if (isFreedomLevel) {
                    positiveLabel = '+5 Supportive random synchronicities, consilience leading to approachability';
                    neutralLabel = '0 Neutral or between the extremes';
                    negativeLabel = '-5 Parts of society/other people are unsupportive of my needs and wants';
                } else {
                    positiveLabel = '+5 Enthusiasm/Fun';
                    neutralLabel = '0 Deeply Calm (Regulated)';
                    negativeLabel = '-5 Fear, Anger, or Activated (Dysregulated)';
                }
                
                return `
                <div class="slider-container" style="${!area.visible ? 'padding: 4px 10px; background: #f3f4f6; margin-bottom: 4px;' : ''}">
                    ${!area.visible ? `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 12px; color: #6b7280; font-weight: 500;">${label}</span>
                            <button class="btn" onclick="toggleLifeAreaVisible('${key}')" 
                                    style="padding: 3px 6px; font-size: 10px; background: #6b7280; color: white;">
                                Show
                            </button>
                        </div>
                    ` : `
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 3px;">
                        <div style="flex: 1;">
                            <div class="slider-header" style="margin-bottom: 0;">
                                <span class="slider-label">${label}</span>
                                <span class="slider-value" style="color: ${getSliderColor(-area.value)};">${getLifeAreaDisplayValue(area.value)}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <button class="btn" onclick="toggleLifeAreaVisible('${key}')" 
                                    style="padding: 4px 8px; font-size: 11px; background: #6b7280; color: white;">
                                Hide
                            </button>
                            <button class="btn" onclick="toggleLifeAreaLock('${key}')" 
                                    style="padding: 4px 8px; font-size: 11px; ${area.locked ? 'background: #f59e0b; color: white;' : 'background: #16a34a; color: white;'}">
                                ${area.locked ? 'Unlock' : 'Lock'}
                            </button>
                        </div>
                    </div>
                    <div class="slider-labels"><span>${positiveLabel}</span><span>${neutralLabel}</span><span>${negativeLabel}</span></div>
                    <input type="range" min="-7" max="7" value="${area.value}" 
                           onchange="updateSlider('life', '${key}', this.value)"
                           ${area.locked ? 'disabled' : ''}
                           style="background: ${key === 'housingComforts' ? getSelfCareSliderGradient() : 'linear-gradient(to right, #64ff64 0%, #4488ff 50%, #ffaa44 75%, #ff4444 100%)'}; ${area.locked ? 'opacity: 0.6; cursor: not-allowed;' : ''}">
                    `}
                </div>
            `;
            }).join('')}
            
            </div>
            
            <div class="subtotal">
                <div class="subtotal-text">Life Areas Net: ${lifeTotal} (negative = draining, positive = energizing)</div>
            </div>
            ` : `
            <div style="padding: 12px; text-align: center; color: #6b7280; font-size: 13px; font-style: italic;">
                Click "Expand" to check in on life areas
            </div>
            `}
        </div>

        <div class="card section-purple">
            <h2>2. Specific Experience or Topic Offloading</h2>
            <div class="subtitle"><em>Rate and describe what you're carrying internally (0-10 each)</em></div>
            
            <div class="examples-box">
                ${!state.section2DescExpanded ? `
                    <div style="margin-bottom: 6px;">
                        <div style="font-size: 13px; color: #374151; line-height: 1.6;">
                            <strong>Threat Response (Dysregulated)</strong> • <strong>Grounded, calm, and approachable (Regulated)</strong> • <strong>Opportunity Responses</strong>
                        </div>
                    </div>
                    <button class="btn" onclick="toggleSection2Desc()" 
                            style="padding: 4px 8px; font-size: 11px; background: #6b7280; color: white;">
                        Show More ▼
                    </button>
                ` : `
                    <div style="margin-bottom: 9px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <div class="examples-title">Three types of internal responses:</div>
                            <button class="btn" onclick="toggleSection2Desc()" 
                                    style="padding: 4px 8px; font-size: 11px; background: #6b7280; color: white;">
                                Hide ▲
                            </button>
                        </div>
                        <textarea id="section2DescTextarea" 
                                  onchange="updateSection2Desc(this.value)" 
                                  oninput="autoResizeTextarea(this)"
                                  style="width: 100%; min-height: 120px; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; font-family: inherit; line-height: 1.5; resize: none; overflow: hidden;">${state.section2DescText}</textarea>
                        <div style="font-size: 11px; color: #6b7280; margin-top: 3px; font-style: italic;">
                            Changes are saved automatically
                        </div>
                    </div>
                `}
            </div>

            ${state.ambient.map((amb, i) => `
                <div class="slider-container" style="position: relative;">
                    <div style="display: flex; gap: 8px; align-items: flex-start; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 250px;">
                            <div style="display: flex; gap: 8px; margin-bottom: 9px; flex-wrap: wrap;">
                                <div style="flex: 1 1 60%; min-width: 200px;">
                                    <label class="input-label">Note/Description:</label>
                                    <textarea onchange="updateAmbient(${amb.id}, 'note', this.value)"
                                              placeholder="Brief description or context..."
                                              ${amb.locked ? 'disabled' : ''}
                                              style="width: 100%; min-height: 60px; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; font-family: inherit; resize: none; ${amb.locked ? 'opacity: 0.6; cursor: not-allowed; background: #f3f4f6;' : ''}">${amb.note}</textarea>
                                </div>
                                <div style="flex: 1 1 35%; min-width: 150px;">
                                    <label class="input-label">Type:</label>
                                    <div style="display: flex; gap: 4px;">
                                        <button onclick="updateAmbient(${amb.id}, 'type', 'threat')" 
                                                ${amb.locked ? 'disabled' : ''}
                                                style="flex: 1; padding: 6px 4px; border: 2px solid #f44336; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; ${amb.type === 'threat' ? 'background: #f44336; color: white;' : 'background: white; color: #f44336;'} ${amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : ''}">
                                            Threat
                                        </button>
                                        <button onclick="updateAmbient(${amb.id}, 'type', 'regulated')" 
                                                ${amb.locked ? 'disabled' : ''}
                                                style="flex: 1; padding: 6px 4px; border: 2px solid #1976d2; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; ${amb.type === 'regulated' ? 'background: #1976d2; color: white;' : 'background: white; color: #1976d2;'} ${amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : ''}">
                                            Reg
                                        </button>
                                        <button onclick="updateAmbient(${amb.id}, 'type', 'opportunity')" 
                                                ${amb.locked ? 'disabled' : ''}
                                                style="flex: 1; padding: 6px 4px; border: 2px solid #4caf50; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; ${amb.type === 'opportunity' ? 'background: #4caf50; color: white;' : 'background: white; color: #4caf50;'} ${amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : ''}">
                                            Opp
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="slider-header">
                                <span class="slider-label" style="font-size: 12px; line-height: 1.3;">${getAmbientSliderLabel(amb.type)}</span>
                                <span class="slider-value" style="color: ${amb.type === 'threat' ? '#f44336' : amb.type === 'regulated' ? '#1976d2' : '#4caf50'};">${amb.value}</span>
                            </div>
                            <input type="range" min="0" max="10" value="${amb.value}" 
                                   onchange="updateAmbient(${amb.id}, 'value', this.value)"
                                   ${amb.locked ? 'disabled' : ''}
                                   style="background: ${getAmbientSliderGradient(amb.type, amb.value)}; ${amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : ''}">
                            <div class="slider-labels"><span>0 Not present</span><span>10 Very present</span></div>
                        </div>
                        
                        <div style="display: flex; gap: 4px; align-self: flex-end; margin-bottom: 3px;">
                            <button class="btn" onclick="toggleAmbientLock(${amb.id})" 
                                    style="padding: 4px 8px; font-size: 11px; white-space: nowrap; ${amb.locked ? 'background: #f59e0b; color: white;' : 'background: #3b82f6; color: white;'}">
                                ${amb.locked ? 'Edit' : 'Save'}
                            </button>
                            <button class="btn" onclick="deleteAmbientSlider(${amb.id})" 
                                    style="padding: 4px 8px; font-size: 11px; white-space: nowrap; background: #dc2626; color: white;">
                                Del
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
            
            ${state.ambient.length < 6 ? `
                <button class="btn" onclick="addAmbientSlider()" 
                        style="background: #9333ea; color: white; width: 100%; padding: 10px; margin-top: 9px;">
                    + Add Topic
                </button>
            ` : `
                <div style="text-align: center; padding: 9px; color: #6b7280; font-style: italic; font-size: 13px;">
                    Maximum of 6 internal experiences reached
                </div>
            `}
        </div>

        <div class="card">
            <h2>Window of Tolerance Visualization</h2>
            <div class="visualization" id="visualization">
                <div class="color-legend"></div>
                
                <div class="zone-labels">
                    <div class="zone-label">Threat Response (Dysregulated):<br>Fear, anxiety, activated feel, anger,<br>hopelessness, powerlessness,<br>and threat of pain responses</div>
                    <div class="zone-label">Grounded, calm,<br>and approachable (Regulated)</div>
                    <div class="zone-label">Opportunity Responses:<br>Enthusiasm, joy, sex, hunger,<br>expansiveness or freedom feelings</div>
                </div>

                <svg viewBox="0 0 600 300" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#0088ff;stop-opacity:0.4" />
                            <stop offset="100%" style="stop-color:#0088ff;stop-opacity:0.9" />
                        </linearGradient>
                    </defs>
                    <path id="riverChannel" class="river-channel" d=""/>
                    <path id="riverWater" class="river-water" d=""/>
                </svg>

                <div class="gate-top">
                    <div class="gate-shape-top" id="gateShapeTop">
                        <div class="gate-interior-top"></div>
                        <div class="gate-outline-top"></div>
                    </div>
                </div>

                <div class="gate-bottom">
                    <div class="gate-shape-bottom" id="gateShapeBottom">
                        <div class="gate-interior-bottom"></div>
                        <div class="gate-outline-bottom"></div>
                    </div>
                </div>

                <div class="gate-text-top" id="gateTextTop">THREAT<br>0</div>
                <div class="gate-text-bottom" id="gateTextBottom">OPPORTUNITY<br>0</div>
                <div class="river-text" id="riverText">Window of Tolerance Width<br>or Internal Information<br>Processing Capacity</div>
                <div class="neutral-list" id="neutralList"></div>
                
                <div class="contributors-list contributors-threat" id="contributorsThreat"></div>
                <div class="contributors-list contributors-opportunity" id="contributorsOpportunity"></div>

                <div class="ground-label">Window of Tolerance<br>Threat: ${threatLoad} | Regulated: ${regulatedLoad} | Opportunity: ${opportunityLoad}</div>
            </div>
        </div>

        <div class="card" style="border: 2px solid #9333ea;">
            <h2>System Load Summary</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin: 12px 0;">
                <div style="background: #fee2e2; padding: 9px; border-radius: 5px; text-align: center;">
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 3px;">Threat Load</div>
                    <div style="font-size: 28px; font-weight: bold; color: #dc2626;">${threatLoad}</div>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 3px;">Dysregulated</div>
                </div>
                <div style="background: #e3f2fd; padding: 9px; border-radius: 5px; text-align: center;">
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 3px;">Regulated Load</div>
                    <div style="font-size: 28px; font-weight: bold; color: #1976d2;">${regulatedLoad}</div>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 3px;">Grounded</div>
                </div>
                <div style="background: #d1fae5; padding: 9px; border-radius: 5px; text-align: center;">
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 3px;">Opportunity Load</div>
                    <div style="font-size: 28px; font-weight: bold; color: #16a34a;">${opportunityLoad}</div>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 3px;">Enthusiasm/Fun</div>
                </div>
            </div>
            <div class="status-box" style="background: ${status.color}; border-color: ${status.border}; color: ${status.textColor};">
                <span class="status-icon">${status.icon}</span>
                <span style="font-weight: 600;">${status.text}</span>
            </div>
        </div>

        <div class="card" style="border: 2px solid #16a34a;">
            <h2>💾 Save Current Entry</h2>
            <div class="subtitle" style="margin-bottom: 12px;">Save a timestamped snapshot of all current ratings to Google Sheets</div>
            
            ${state.saveError ? `<div class="error-message">${state.saveError}</div>` : ''}
            
            <button class="btn btn-success" onclick="saveEntry()">Save Entry</button>
        </div>

        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h2 style="margin: 0;">Saved Entries: ${state.entries.length}</h2>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" style="background: #3b82f6; color: white;" onclick="copyEntries()" ${state.entries.length === 0 ? 'disabled style="background: #d1d5db; cursor: not-allowed;"' : ''}>📋 Copy All</button>
                    <button class="btn" style="background: #dc2626; color: white;" onclick="clearEntries()" ${state.entries.length === 0 ? 'disabled style="background: #d1d5db; cursor: not-allowed;"' : ''}>🗑️ Clear All</button>
                </div>
            </div>
            
            ${state.entries.length === 0 ? '<div style="text-align: center; padding: 36px 0; color: #6b7280;">No saved entries yet</div>' : `
                <div style="max-height: 450px; overflow-y: auto;">
                    ${state.entries.map(e => `
                        <div class="entry-item">
                            <div class="entry-timestamp">
                                ${new Date(e.timestamp).toLocaleString()}
                            </div>
                            
                            <div class="entry-section">
                                <div class="entry-section-title">System Loads</div>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 6px;">
                                    <div style="background: #fee2e2; padding: 6px; border-radius: 4px; text-align: center;">
                                        <div style="font-size: 10px; color: #6b7280;">Threat</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #dc2626;">${e.threatLoad || 0}</div>
                                    </div>
                                    <div style="background: #e3f2fd; padding: 6px; border-radius: 4px; text-align: center;">
                                        <div style="font-size: 10px; color: #6b7280;">Regulated</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #1976d2;">${e.regulatedLoad || 0}</div>
                                    </div>
                                    <div style="background: #d1fae5; padding: 6px; border-radius: 4px; text-align: center;">
                                        <div style="font-size: 10px; color: #6b7280;">Opportunity</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #16a34a;">${e.opportunityLoad || 0}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="entry-section">
                                <div class="entry-section-title">Life Areas (Total: ${e.lifeTotal})</div>
                                <div class="entry-life-areas">
                                    <div>Mental: <strong>${e.lifeAreas.mental}</strong></div>
                                    <div>Somatic/Body: <strong>${e.lifeAreas.somaticBody}</strong></div>
                                    <div>Emotional: <strong>${e.lifeAreas.emotional}</strong></div>
                                    <div>Housing/Comforts: <strong>${e.lifeAreas.housingComforts}</strong></div>
                                    <div>Work/Income: <strong>${e.lifeAreas.workMoney}</strong></div>
                                    <div>Money/Resources: <strong>${e.lifeAreas.moneyHandling || '00'}</strong></div>
                                    <div>Personal Relations: <strong>${e.lifeAreas.spiritual}</strong></div>
                                    <div>Spiritual Outlook: <strong>${e.lifeAreas.freedomLevel}</strong></div>
                                </div>
                            </div>

                            <div class="entry-section">
                                <div class="entry-section-title">Internal Experiences</div>
                                ${e.ambient.filter(a => a.value !== 0).length === 0 ? 
                                    '<div style="font-style: italic; color: #6b7280; font-size: 12px;">No internal experiences recorded</div>' :
                                    e.ambient.filter(a => a.value !== 0).map((a, i) => {
                                        const typeLabels = {
                                            'threat': 'Threat Response',
                                            'regulated': 'Regulated/Grounded',
                                            'opportunity': 'Opportunity Response'
                                        };
                                        return `
                                        <div class="entry-ambient">
                                            <div class="entry-ambient-header">[${a.value}/10] - ${typeLabels[a.type] || a.type}</div>
                                            <div class="entry-ambient-note">"${a.note}"</div>
                                        </div>
                                    `;
                                    }).join('')
                                }
                            </div>

                            <div class="entry-total">
                                Total Load: ${e.total} (${e.pct}%)
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;

    document.getElementById('app').innerHTML = html;
    
    // Auto-resize section 2 description textarea if it exists
    const section2Textarea = document.getElementById('section2DescTextarea');
    if (section2Textarea) {
        autoResizeTextarea(section2Textarea);
    }
    
    setTimeout(() => updateVisualization(threatLoad, opportunityLoad, regulatedLoad), 0);
}

render();
