// State with new section organization
const state = {
    section1Expanded: false,
    section2Expanded: false,
    section3Expanded: false,
    section4Expanded: false,

    // Custom sliders for sections
    customExternal: [], // Section 2
    customSupports: [], // Section 4

    // Section 1: Baseline + Internal Self
    baseline: {
        regulation: { value: 0, interacted: false, locked: false },
        flexibility: { value: 0, interacted: false, locked: false }
    },
    internalSelf: {
        mental: { value: 0, locked: false, interacted: false, visible: false },
        somaticBody: { value: 0, locked: false, interacted: false, visible: false },
        emotional: { value: 0, locked: false, interacted: false, visible: false },
        spiritual: { value: 0, locked: false, interacted: false, visible: false }
    },

    // Section 2: External Life Areas
    externalAreas: {
        homeImprovement: { value: 0, locked: false, interacted: false, visible: false },
        workMoney: { value: 0, locked: false, interacted: false, visible: false },
        moneyHandling: { value: 0, locked: false, interacted: false, visible: false },
        relationships: { value: 0, locked: false, interacted: false, visible: false }
    },

    // Section 3: Known Supports
    supports: {
        housingComforts: { value: 0, locked: false, interacted: false, visible: false },
        sleepQuality: { value: 0, locked: false, interacted: false, visible: false },
        socialConnection: { value: 0, locked: false, interacted: false, visible: false },
        financialCushion: { value: 0, locked: false, interacted: false, visible: false }
    },

    // Section 4: Specific Experiences
    ambient: [
        { id: Date.now(), value: 0, type: 'opportunity', note: '', locked: false }
    ],

    entries: [],
    saveError: ''
};

// Toggle section expansion
function toggleSection(section) {
    if (section === 1) state.section1Expanded = !state.section1Expanded;
    if (section === 2) state.section2Expanded = !state.section2Expanded;
    if (section === 3) state.section3Expanded = !state.section3Expanded;
    if (section === 4) state.section4Expanded = !state.section4Expanded;
    render();
}

// Toggle life area visibility
function toggleAreaVisible(category, key) {
    state[category][key].visible = !state[category][key].visible;
    render();
}

function getDisplayValue(internalValue) {
    if (internalValue === 0) return '0';
    if (internalValue > 0) return '+' + internalValue;
    if (internalValue < 0) return internalValue.toString();
    return '0';
}

function getSliderColor(value) {
    if (value > 0) {
        const intensity = value / 5;
        const red = Math.round(100 - (100 * intensity));
        const green = Math.round(220 + (35 * intensity));
        const blue = Math.round(100 - (100 * intensity));
        return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    } else if (value < 0) {
        const absValue = Math.abs(value);
        if (absValue <= 1.5) {
            const intensity = absValue / 1.5;
            const red = Math.round(68 + (200 * intensity));
            const green = Math.round(136 + (100 * intensity));
            const blue = Math.round(255 - (155 * intensity));
            return 'rgb(' + Math.min(red, 255) + ', ' + Math.min(green, 255) + ', ' + blue + ')';
        } else {
            const intensity = (absValue - 1.5) / 3.5;
            const red = 255;
            const green = Math.round(236 - (136 * intensity));
            const blue = Math.round(100 - (100 * intensity));
            return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        }
    } else {
        return 'rgb(68, 136, 255)';
    }
}

function getAreaBackgroundColor(value) {
    if (value >= 3) {
        return 'rgba(68, 136, 255, 0.25)';
    } else if (value >= 1) {
        return 'rgba(68, 136, 255, 0.15)';
    } else if (value === 0) {
        return '#f9fafb';
    } else if (value >= -2) {
        return 'rgba(255, 235, 59, 0.4)';
    } else if (value >= -4) {
        return 'rgba(255, 152, 0, 0.35)';
    } else {
        return 'rgba(244, 67, 54, 0.3)';
    }
}

function getBaselineSliderGradient() {
    return 'linear-gradient(to right, #4488ff 0%, #bbdefb 30%, #d3d3d3 50%, #ffeb3b 65%, #ff9800 82.5%, #f44336 100%)';
}

function getStandardSliderGradient() {
    return 'linear-gradient(to right, #64ff64 0%, #4488ff 50%, #ffaa44 75%, #ff4444 100%)';
}

function toggleLock(category, key) {
    state[category][key].locked = !state[category][key].locked;
    render();
}

function toggleSliderEdit(category, key) {
    state[category][key].editing = !state[category][key].editing;
    render();
}

function saveSliderEdit(category, key) {
    const area = state[category][key];
    const labelInput = document.getElementById('label_' + category + '_' + key);
    const posInput = document.getElementById('pos_' + category + '_' + key);
    const negInput = document.getElementById('neg_' + category + '_' + key);

    if (labelInput && posInput && negInput) {
        area.label = labelInput.value;
        area.posLabel = posInput.value;
        area.negLabel = negInput.value;
    }

    area.editing = false;
    render();
}

function deleteSlider(category, key) {
    if (confirm('Delete this slider? This cannot be undone.')) {
        state[category][key].visible = false;
        state[category][key].value = 0;
        state[category][key].locked = false;
        state[category][key].interacted = false;
        render();
    }
}

function toggleAmbientLock(id) {
    const amb = state.ambient.find(a => a.id === id);
    if (amb) {
        amb.locked = !amb.locked;
        render();
    }
}

function addAmbientSlider() {
    if (state.ambient.length >= 6) return;
    state.ambient.push({
        id: Date.now(),
        value: 0,
        type: 'opportunity',
        note: '',
        locked: false
    });
    render();
}

function deleteAmbientSlider(id) {
    if (state.ambient.length <= 1) {
        alert('Must keep at least one internal experience slider');
        return;
    }
    state.ambient = state.ambient.filter(a => a.id !== id);
    render();
}

function addCustomSlider(section) {
    const customArray = section === 'external' ? state.customExternal : state.customSupports;
    customArray.push({
        id: Date.now(),
        label: 'New Slider',
        posLabel: '+5 Positive',
        negLabel: '-5 Negative',
        value: 0,
        locked: false,
        editing: false,
        interacted: false
    });
    render();
}

function toggleCustomEdit(section, id) {
    const customArray = section === 'external' ? state.customExternal : state.customSupports;
    const slider = customArray.find(s => s.id === id);
    if (slider) {
        slider.editing = !slider.editing;
        render();
    }
}

function saveCustomSlider(section, id, label, posLabel, negLabel) {
    const customArray = section === 'external' ? state.customExternal : state.customSupports;
    const slider = customArray.find(s => s.id === id);
    if (slider) {
        if (slider.editing) {
            slider.label = label;
            slider.posLabel = posLabel;
            slider.negLabel = negLabel;
            slider.editing = false;
        } else {
            slider.locked = !slider.locked;
        }
        render();
    }
}

function deleteCustomSlider(section, id) {
    if (section === 'external') {
        state.customExternal = state.customExternal.filter(s => s.id !== id);
    } else {
        state.customSupports = state.customSupports.filter(s => s.id !== id);
    }
    render();
}

function updateCustomSlider(section, id, value) {
    const customArray = section === 'external' ? state.customExternal : state.customSupports;
    const slider = customArray.find(s => s.id === id);
    if (slider && !slider.locked) {
        slider.value = parseInt(value);
        slider.interacted = true;
        render();
    }
}

function updateSlider(category, key, value) {
    if (!state[category][key].locked) {
        state[category][key].value = parseInt(value);
        state[category][key].interacted = true;
        render();
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

function getThreatLoad() {
    let threatTotal = 0;

    Object.values(state.baseline).forEach(slider => {
        if (!slider.interacted) return;
        if (slider.value < -1) {
            threatTotal += Math.abs(slider.value) - 1;
        }
    });

    Object.values(state.internalSelf).forEach(area => {
        if (!area.interacted) return;
        if (area.value < -1) {
            threatTotal += Math.abs(area.value) - 1;
        }
    });

    Object.values(state.externalAreas).forEach(area => {
        if (!area.interacted) return;
        if (area.value < -1) {
            threatTotal += Math.abs(area.value) - 1;
        }
    });

    Object.values(state.supports).forEach(support => {
        if (!support.interacted) return;
        if (support.value < -1) {
            threatTotal += Math.abs(support.value) - 1;
        }
    });

    state.ambient.forEach(amb => {
        if (amb.value !== 0 && amb.type === 'threat') {
            threatTotal += amb.value;
        }
    });

    return threatTotal;
}

function getOpportunityLoad() {
    let opportunityTotal = 0;

    Object.values(state.internalSelf).forEach(area => {
        if (!area.interacted) return;
        if (area.value > 1) {
            opportunityTotal += (area.value - 1);
        }
    });

    Object.values(state.externalAreas).forEach(area => {
        if (!area.interacted) return;
        if (area.value > 1) {
            opportunityTotal += (area.value - 1);
        }
    });

    state.ambient.forEach(amb => {
        if (amb.value !== 0 && amb.type === 'opportunity') {
            opportunityTotal += amb.value;
        }
    });

    return opportunityTotal;
}

function getRegulatedLoad() {
    let regulatedTotal = 0;

    Object.values(state.baseline).forEach(slider => {
        if (!slider.interacted) return;
        if (slider.value === -1 || slider.value === 1) {
            regulatedTotal += 1;
        } else if (slider.value > 1) {
            regulatedTotal += (slider.value - 1);
        }
    });

    Object.values(state.internalSelf).forEach(area => {
        if (!area.interacted) return;
        if (area.value === -1 || area.value === 1) {
            regulatedTotal += 1;
        }
    });

    Object.values(state.externalAreas).forEach(area => {
        if (!area.interacted) return;
        if (area.value === -1 || area.value === 1) {
            regulatedTotal += 1;
        }
    });

    Object.values(state.supports).forEach(support => {
        if (!support.interacted) return;
        if (support.value === -1 || support.value === 1) {
            regulatedTotal += 1;
        } else if (support.value > 1) {
            regulatedTotal += (support.value - 1);
        }
    });

    state.ambient.forEach(amb => {
        if (amb.value !== 0 && amb.type === 'regulated') {
            regulatedTotal += amb.value;
        }
    });

    return regulatedTotal;
}

function validateSave() {
    const errors = [];
    state.ambient.forEach((amb, i) => {
        if (amb.value !== 0) {
            if (!amb.type) errors.push('Internal Activity ' + (i+1) + ': Type is required when slider is not at 0');
            if (!amb.note.trim()) errors.push('Internal Activity ' + (i+1) + ': Note is required when slider is not at 0');
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

    const threatLoad = getThreatLoad();
    const opportunityLoad = getOpportunityLoad();
    const regulatedLoad = getRegulatedLoad();

    const entry = {
        timestamp: new Date().toISOString(),
        baseline: Object.keys(state.baseline).reduce((acc, key) => {
            acc[key] = state.baseline[key].value;
            return acc;
        }, {}),
        internalSelf: Object.keys(state.internalSelf).reduce((acc, key) => {
            acc[key] = state.internalSelf[key].value;
            return acc;
        }, {}),
        externalAreas: Object.keys(state.externalAreas).reduce((acc, key) => {
            acc[key] = state.externalAreas[key].value;
            return acc;
        }, {}),
        supports: Object.keys(state.supports).reduce((acc, key) => {
            acc[key] = state.supports[key].value;
            return acc;
        }, {}),
        ambient: state.ambient.map(a => ({
            value: a.value,
            type: a.type,
            note: a.note
        })),
        threatLoad,
        opportunityLoad,
        regulatedLoad
    };

    state.entries.unshift(entry);

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
        return '=== ' + date + ' ===\nThreat: ' + e.threatLoad + ' | Regulated: ' + e.regulatedLoad + ' | Opportunity: ' + e.opportunityLoad;
    }).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Entries copied!');
}

function clearEntries() {
    if (confirm('Clear all entries?')) {
        state.entries = [];
        render();
    }
}

function openIntroModal() {
    document.getElementById('introModal').classList.add('active');
}

function closeIntroModal() {
    document.getElementById('introModal').classList.remove('active');
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
    const maxLoad = 50;
    const minGateHeight = 30;

    // Calculate reduction from regulated load - each regulated point reduces gates
    const regulatedReduction = regulatedLoad * 2; // Each regulated point reduces by 2px per gate

    // Gates start at minimum height (30px at zero load) and grow from there
    let topGateHeight = minGateHeight + Math.max(0, Math.min((threatLoad / maxLoad) * height * 1.8, height * 0.9) - regulatedReduction);
    let bottomGateHeight = minGateHeight + Math.max(0, Math.min((opportunityLoad / maxLoad) * height * 1.8, height * 0.9) - regulatedReduction);

    const combinedHeight = topGateHeight + bottomGateHeight;
    const maxCombined = height * 0.9;

    if (combinedHeight > maxCombined) {
        const scaleFactor = maxCombined / combinedHeight;
        topGateHeight = Math.max(minGateHeight, topGateHeight * scaleFactor);
        bottomGateHeight = Math.max(minGateHeight, bottomGateHeight * scaleFactor);
    }

    gateShapeTop.style.height = topGateHeight + 'px';
    gateShapeBottom.style.height = bottomGateHeight + 'px';

    const availableSpace = height - topGateHeight - bottomGateHeight;

    const topPercent = Math.round((topGateHeight / height) * 100);
    const bottomPercent = Math.round((bottomGateHeight / height) * 100);
    const middlePercent = Math.round((availableSpace / height) * 100);

    gateTextTop.textContent = 'Stress - ' + topPercent + '%';
    gateTextBottom.textContent = 'Opportunity - ' + bottomPercent + '%';

    const percentagesDisplay = document.getElementById('currentPercentages');
    if (percentagesDisplay) {
        percentagesDisplay.textContent = 'Stress: ' + topPercent + '% | Regulated: ' + middlePercent + '% | Opportunity: ' + bottomPercent + '%';
    }

    const regulatedFactor = regulatedLoad / 30;

    const maxThreatForColor = 40;
    const maxOppForColor = 40;
    const maxRegForColor = 30;

    const threatIntensity = Math.min(threatLoad / maxThreatForColor, 1);
    const opportunityIntensity = Math.min(opportunityLoad / maxOppForColor, 1);
    const regulatedIntensity = Math.min(regulatedLoad / maxRegForColor, 1);

    let threatR, threatG, threatB;
    if (threatIntensity === 0) {
        threatR = 255; threatG = 240; threatB = 150;
    } else if (threatIntensity < 0.5) {
        const factor = threatIntensity * 2;
        threatR = 255;
        threatG = Math.round(240 - (80 * factor));
        threatB = Math.round(150 - (90 * factor));
    } else {
        const factor = (threatIntensity - 0.5) * 2;
        threatR = 255;
        threatG = Math.round(160 - (92 * factor));
        threatB = Math.round(60 - (60 * factor));
    }

    let riverR, riverG, riverB;
    if (regulatedIntensity === 0) {
        riverR = 180; riverG = 180; riverB = 180;
    } else {
        riverR = Math.round(180 - (112 * regulatedIntensity));
        riverG = Math.round(180 - (44 * regulatedIntensity));
        riverB = Math.round(180 + (75 * regulatedIntensity));
    }

    let oppR, oppG, oppB;
    if (opportunityIntensity === 0) {
        oppR = 180; oppG = 230; oppB = 180;
    } else if (opportunityIntensity < 0.5) {
        const factor = opportunityIntensity * 2;
        oppR = Math.round(200 - (132 * factor));
        oppG = Math.round(230 - (25 * factor));
        oppB = Math.round(200 - (132 * factor));
    } else {
        const factor = (opportunityIntensity - 0.5) * 2;
        oppR = Math.round(68 + (137 * factor));
        oppG = Math.round(205 + (30 * factor));
        oppB = Math.round(68 - (9 * factor));
    }

    visualization.style.background = 'linear-gradient(to bottom, ' +
        'rgb(' + threatR + ', ' + threatG + ', ' + threatB + ') 0%, ' +
        'rgb(' + threatR + ', ' + threatG + ', ' + threatB + ') ' + ((topGateHeight / height) * 100) + '%, ' +
        'rgb(' + riverR + ', ' + riverG + ', ' + riverB + ') ' + ((topGateHeight / height) * 100) + '%, ' +
        'rgb(' + riverR + ', ' + riverG + ', ' + riverB + ') ' + (((height - bottomGateHeight) / height) * 100) + '%, ' +
        'rgb(' + oppR + ', ' + oppG + ', ' + oppB + ') ' + (((height - bottomGateHeight) / height) * 100) + '%, ' +
        'rgb(' + oppR + ', ' + oppG + ', ' + oppB + ') 100%)';

    const width = 600;
    const riverTop = topGateHeight;
    const riverBottom = height - bottomGateHeight;
    const riverHeight = riverBottom - riverTop;

    const spaceFactor = availableSpace / height;
    const maxChannelWidth = height * 0.5;
    const minChannelWidth = height * 0.08;

    let channelWidth = minChannelWidth + (spaceFactor * (maxChannelWidth - minChannelWidth));
    const regulatedBonus = regulatedFactor * (height * 0.4);
    channelWidth = Math.min(channelWidth + regulatedBonus, riverHeight * 0.95);

    const waterWidth = channelWidth * 0.85;

    const channelTopY = riverTop;
    const channelBottomY = riverBottom;

    const channelPath = 'M 0,' + channelTopY + ' L ' + width + ',' + channelTopY + ' L ' + width + ',' + channelBottomY + ' L 0,' + channelBottomY + ' Z';

    const waterTopY = riverTop + (riverHeight - waterWidth) / 2;
    const waterBottomY = waterTopY + waterWidth;
    const waterPath = 'M 0,' + waterTopY + ' L ' + width + ',' + waterTopY + ' L ' + width + ',' + waterBottomY + ' L 0,' + waterBottomY + ' Z';

    riverChannel.setAttribute('d', channelPath);
    riverWater.setAttribute('d', waterPath);

    const centerY = topGateHeight + (availableSpace / 2);
    riverText.style.top = centerY + 'px';

    riverText.innerHTML = 'Regulated<br>Processing<br>Capacity - ' + middlePercent + '%';

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
}

function getAmbientSliderGradient(type) {
    if (type === 'threat') {
        return 'linear-gradient(to right, #ffeb3b 0%, #ff9800 50%, #f44336 100%)';
    } else if (type === 'regulated') {
        return 'linear-gradient(to right, #bbdefb 0%, #1976d2 100%)';
    } else if (type === 'opportunity') {
        return 'linear-gradient(to right, #c8e6c9 0%, #4caf50 50%, #cddc39 100%)';
    }
    return 'linear-gradient(to right, #d1d5db 0%, #d1d5db 100%)';
}

function buildSlider(category, key, label, posLabel, negLabel, gradient) {
    const area = state[category][key];
    const displayValue = getDisplayValue(area.value);
    const bgColor = getAreaBackgroundColor(area.value);

    if (area.editing === undefined) area.editing = false;

    if (!area.visible) {
        return '<div class="slider-container" style="padding: 5px 10px; background: #f3f4f6; margin-bottom: 4px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">' +
                '<span style="font-size: 13px; color: #374151; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + label + '</span>' +
                '<button class="btn" onclick="toggleAreaVisible(\'' + category + '\', \'' + key + '\')" ' +
                        'style="padding: 4px 8px; font-size: 11px; background: #6b7280; color: white; flex-shrink: 0;">' +
                    'Show' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    if (!area.label) area.label = label;
    if (!area.posLabel) area.posLabel = posLabel;
    if (!area.negLabel) area.negLabel = negLabel;

    if (area.editing) {
        return '<div class="slider-container" style="background: ' + bgColor + '; width: 100%;">' +
            '<div style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 6px; flex-wrap: wrap;">' +
                '<div style="flex: 1; min-width: 200px;">' +
                    '<input type="text" value="' + area.label + '" id="label_' + category + '_' + key + '" ' +
                           'placeholder="Slider name..." ' +
                           'style="width: 100%; padding: 6px; border: 2px solid #3b82f6; border-radius: 4px; font-size: 13px; font-weight: 600; margin-bottom: 4px;">' +
                    '<div style="display: flex; gap: 4px; margin-bottom: 4px;">' +
                        '<input type="text" value="' + area.posLabel + '" id="pos_' + category + '_' + key + '" ' +
                               'placeholder="+5 label..." ' +
                               'style="flex: 1; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 11px;">' +
                        '<input type="text" value="' + area.negLabel + '" id="neg_' + category + '_' + key + '" ' +
                               'placeholder="-5 label..." ' +
                               'style="flex: 1; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 11px;">' +
                    '</div>' +
                '</div>' +
                '<div style="display: flex; gap: 4px;">' +
                    '<button class="btn" onclick="deleteSlider(\'' + category + '\', \'' + key + '\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #dc2626; color: white;">' +
                        'Delete' +
                    '</button>' +
                    '<button class="btn" onclick="saveSliderEdit(\'' + category + '\', \'' + key + '\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #16a34a; color: white;">' +
                        'Save' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="slider-labels">' +
                '<span>' + area.posLabel + '</span>' +
                '<span>0 Neutral</span>' +
                '<span>' + area.negLabel + '</span>' +
            '</div>' +
            '<input type="range" min="-5" max="5" value="' + (-area.value) + '" ' +
                   'onchange="updateSlider(\'' + category + '\', \'' + key + '\', -this.value)" ' +
                   (area.locked ? 'disabled' : '') + ' ' +
                   'style="background: ' + gradient + '; ' + (area.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
        '</div>';
    } else {
        return '<div class="slider-container" style="background: ' + bgColor + '; width: 100%;">' +
            '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 3px;">' +
                '<div style="flex: 1;">' +
                    '<div class="slider-header" style="margin-bottom: 0;">' +
                        '<span class="slider-label">' + area.label + '</span>' +
                        '<span class="slider-value" style="color: #111827;">' + displayValue + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="display: flex; gap: 4px;">' +
                    '<button class="btn" onclick="toggleAreaVisible(\'' + category + '\', \'' + key + '\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #6b7280; color: white;">' +
                        'Hide' +
                    '</button>' +
                    '<button class="btn" onclick="toggleSliderEdit(\'' + category + '\', \'' + key + '\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #3b82f6; color: white;">' +
                        'Edit' +
                    '</button>' +
                    '<button class="btn" onclick="toggleLock(\'' + category + '\', \'' + key + '\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; ' + (area.locked ? 'background: #f59e0b; color: white;' : 'background: #16a34a; color: white;') + '">' +
                        (area.locked ? 'Unlock' : 'Lock') +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="slider-labels">' +
                '<span>' + area.posLabel + '</span>' +
                '<span>0 Neutral</span>' +
                '<span>' + area.negLabel + '</span>' +
            '</div>' +
            '<input type="range" min="-5" max="5" value="' + (-area.value) + '" ' +
                   'onchange="updateSlider(\'' + category + '\', \'' + key + '\', -this.value)" ' +
                   (area.locked ? 'disabled' : '') + ' ' +
                   'style="background: ' + gradient + '; ' + (area.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
        '</div>';
    }
}

function buildCustomSlider(section, slider) {
    const displayValue = getDisplayValue(slider.value);
    const bgColor = getAreaBackgroundColor(slider.value);
    const gradient = getStandardSliderGradient();

    if (slider.editing) {
        return '<div class="slider-container" style="background: ' + bgColor + '; width: 100%;">' +
            '<div style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 6px; flex-wrap: wrap;">' +
                '<div style="flex: 1; min-width: 200px;">' +
                    '<input type="text" value="' + slider.label + '" id="label_' + slider.id + '" ' +
                           'placeholder="Slider name..." ' +
                           'style="width: 100%; padding: 6px; border: 2px solid #3b82f6; border-radius: 4px; font-size: 13px; font-weight: 600; margin-bottom: 4px;">' +
                    '<div style="display: flex; gap: 4px; margin-bottom: 4px;">' +
                        '<input type="text" value="' + slider.posLabel + '" id="pos_' + slider.id + '" ' +
                               'placeholder="+5 label..." ' +
                               'style="flex: 1; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 11px;">' +
                        '<input type="text" value="' + slider.negLabel + '" id="neg_' + slider.id + '" ' +
                               'placeholder="-5 label..." ' +
                               'style="flex: 1; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 11px;">' +
                    '</div>' +
                '</div>' +
                '<div style="display: flex; gap: 4px;">' +
                    '<button class="btn" onclick="deleteCustomSlider(\'' + section + '\', ' + slider.id + ')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #dc2626; color: white;">' +
                        'Delete' +
                    '</button>' +
                    '<button class="btn" onclick="saveCustomSlider(\'' + section + '\', ' + slider.id + ', ' +
                            'document.getElementById(\'label_' + slider.id + '\').value, ' +
                            'document.getElementById(\'pos_' + slider.id + '\').value, ' +
                            'document.getElementById(\'neg_' + slider.id + '\').value)" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #16a34a; color: white;">' +
                        'Save' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="slider-labels">' +
                '<span>' + slider.posLabel + '</span>' +
                '<span>0 Neutral</span>' +
                '<span>' + slider.negLabel + '</span>' +
            '</div>' +
            '<input type="range" min="-5" max="5" value="' + (-slider.value) + '" ' +
                   'onchange="updateCustomSlider(\'' + section + '\', ' + slider.id + ', -this.value)" ' +
                   (slider.locked ? 'disabled' : '') + ' ' +
                   'style="background: ' + gradient + '; ' + (slider.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
        '</div>';
    } else {
        return '<div class="slider-container" style="background: ' + bgColor + '; width: 100%;">' +
            '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 3px;">' +
                '<div style="flex: 1;">' +
                    '<div class="slider-header" style="margin-bottom: 0;">' +
                        '<span class="slider-label">' + slider.label + '</span>' +
                        '<span class="slider-value" style="color: #111827;">' + displayValue + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="display: flex; gap: 4px;">' +
                    '<button class="btn" onclick="toggleCustomEdit(\'' + section + '\', ' + slider.id + ')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #3b82f6; color: white;">' +
                        'Edit' +
                    '</button>' +
                    '<button class="btn" onclick="saveCustomSlider(\'' + section + '\', ' + slider.id + ', \'\', \'\', \'\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; ' + (slider.locked ? 'background: #f59e0b; color: white;' : 'background: #16a34a; color: white;') + '">' +
                        (slider.locked ? 'Unlock' : 'Lock') +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="slider-labels">' +
                '<span>' + slider.posLabel + '</span>' +
                '<span>0 Neutral</span>' +
                '<span>' + slider.negLabel + '</span>' +
            '</div>' +
            '<input type="range" min="-5" max="5" value="' + (-slider.value) + '" ' +
                   'onchange="updateCustomSlider(\'' + section + '\', ' + slider.id + ', -this.value)" ' +
                   (slider.locked ? 'disabled' : '') + ' ' +
                   'style="background: ' + gradient + '; ' + (slider.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
        '</div>';
    }
}

function render() {
    const html =
        '<div class="card header" style="padding: 12px;">' +
            '<div style="display: flex; align-items: center; gap: 12px;">' +
                '<h1 style="margin: 0;">Offload</h1>' +
                '<div class="subtitle" style="margin: 0;">An emotion tolerance and shadow work companion.</div>' +
            '</div>' +
        '</div>' +

        '<div class="card" style="text-align: center; padding: 12px; margin-bottom: 12px;">' +
            '<div style="display: flex; justify-content: center; align-items: center; gap: 12px;">' +
                '<div style="font-size: 16px; font-weight: 600; color: #111827;">Where would you like to start?</div>' +
                '<button class="btn" onclick="openIntroModal()" style="padding: 6px 12px; font-size: 13px; background: #6366f1; color: white;">ℹ️ Intro</button>' +
            '</div>' +
        '</div>' +

        '<div class="sections-grid">' +

        // Section 1: Baseline + Internal Self
        '<div class="section-card section-green ' + (state.section1Expanded ? 'expanded' : '') + '" ' +
             (state.section1Expanded ? '' : 'onclick="event.stopPropagation(); toggleSection(1)"') + '>' +
            '<div class="section-header">' +
                '<div>' +
                    '<div class="section-title">1. Residual Stress, Option Flexibility, & Inner Self Check-Ins</div>' +
                    (state.section1Expanded ? '' : '<div class="section-subtitle">How am I doing right now?</div>') +
                '</div>' +
                '<button class="expand-btn" onclick="event.stopPropagation(); toggleSection(1)" style="background: #eab308;">' +
                    (state.section1Expanded ? 'Hide ▲' : 'Show ▼') +
                '</button>' +
            '</div>' +
            (state.section1Expanded ?
                '<div style="margin-top: 12px;">' +
                    '<div style="font-weight: 600; font-size: 13px; color: #374151; margin-bottom: 6px; padding-left: 4px;">Baseline:</div>' +
                    '<div class="slider-container">' +
                        '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 3px; flex-wrap: wrap;">' +
                            '<div style="flex: 1; min-width: 200px;">' +
                                '<div class="slider-header" style="margin-bottom: 0;">' +
                                    '<span class="slider-label" style="font-size: 13px;">Residual stress from recent days</span>' +
                                    '<span class="slider-value" style="color: #111827;">' + getDisplayValue(state.baseline.regulation.value) + '</span>' +
                                '</div>' +
                            '</div>' +
                            '<button class="btn" onclick="toggleLock(\'baseline\', \'regulation\')" ' +
                                    'style="padding: 4px 8px; font-size: 11px; white-space: nowrap; ' + (state.baseline.regulation.locked ? 'background: #f59e0b; color: white;' : 'background: #16a34a; color: white;') + '">' +
                                (state.baseline.regulation.locked ? 'Unlock' : 'Lock') +
                            '</button>' +
                        '</div>' +
                        '<div class="slider-labels">' +
                            '<span>+5 Consistently regulated</span>' +
                            '<span>0 Mixed</span>' +
                            '<span>-5 Dysregulated</span>' +
                        '</div>' +
                        '<input type="range" min="-5" max="5" value="' + (-state.baseline.regulation.value) + '" ' +
                               'onchange="updateSlider(\'baseline\', \'regulation\', -this.value)" ' +
                               (state.baseline.regulation.locked ? 'disabled' : '') + ' ' +
                               'style="background: ' + getBaselineSliderGradient() + '; ' + (state.baseline.regulation.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
                    '</div>' +
                    '<div class="slider-container">' +
                        '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 3px; flex-wrap: wrap;">' +
                            '<div style="flex: 1; min-width: 200px;">' +
                                '<div class="slider-header" style="margin-bottom: 0;">' +
                                    '<span class="slider-label" style="font-size: 13px;">Flexibility of choices or options</span>' +
                                    '<span class="slider-value" style="color: #111827;">' + getDisplayValue(state.baseline.flexibility.value) + '</span>' +
                                '</div>' +
                            '</div>' +
                            '<button class="btn" onclick="toggleLock(\'baseline\', \'flexibility\')" ' +
                                    'style="padding: 4px 8px; font-size: 11px; white-space: nowrap; ' + (state.baseline.flexibility.locked ? 'background: #f59e0b; color: white;' : 'background: #16a34a; color: white;') + '">' +
                                (state.baseline.flexibility.locked ? 'Unlock' : 'Lock') +
                            '</button>' +
                        '</div>' +
                        '<div class="slider-labels">' +
                            '<span>+5 Complete freedom</span>' +
                            '<span>0 Some flexibility</span>' +
                            '<span>-5 Locked in</span>' +
                        '</div>' +
                        '<input type="range" min="-5" max="5" value="' + (-state.baseline.flexibility.value) + '" ' +
                               'onchange="updateSlider(\'baseline\', \'flexibility\', -this.value)" ' +
                               (state.baseline.flexibility.locked ? 'disabled' : '') + ' ' +
                               'style="background: ' + getBaselineSliderGradient() + '; ' + (state.baseline.flexibility.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
                    '</div>' +
                    '<div style="font-weight: 600; font-size: 13px; color: #374151; margin: 12px 0 6px 0; padding-left: 4px;">Internal Self:</div>' +
                    '<div>' +
                        buildSlider('internalSelf', 'mental', 'Mental Activity', '+5 Creative, Pleasant', '-5 Racing/Ruminating', getStandardSliderGradient()) +
                        buildSlider('internalSelf', 'somaticBody', 'Somatic &/or Body', '+5 Calm, relaxed', '-5 Aches/pains', getStandardSliderGradient()) +
                        buildSlider('internalSelf', 'emotional', 'Emotional', '+5 Joy/Enthusiasm', '-5 Fear/Anger', getStandardSliderGradient()) +
                        buildSlider('internalSelf', 'spiritual', 'Spiritual Outlook', '+5 Supportive synchronicities', '-5 Unsupportive society', getStandardSliderGradient()) +
                        state.customExternal.map(slider => buildCustomSlider('external', slider)).join('') +
                    '</div>' +
                    '<button class="btn" onclick="addCustomSlider(\'external\')" ' +
                            'style="background: #eab308; color: white; width: 100%; padding: 10px; margin-top: 9px;">' +
                        '+ Add Custom Slider' +
                    '</button>' +
                '</div>'
            : '') +
        '</div>' +

        // Section 2: External Life Areas
        '<div class="section-card section-blue ' + (state.section2Expanded ? 'expanded' : '') + '" ' +
             (state.section2Expanded ? '' : 'onclick="event.stopPropagation(); toggleSection(2)"') + '>' +
            '<div class="section-header">' +
                '<div>' +
                    '<div class="section-title">2. External Life Areas</div>' +
                    (state.section2Expanded ? '' : '<div class="section-subtitle">What\'s happening in my environment?</div>') +
                '</div>' +
                '<button class="expand-btn" onclick="event.stopPropagation(); toggleSection(2)" style="background: #16a34a;">' +
                    (state.section2Expanded ? 'Hide ▲' : 'Show ▼') +
                '</button>' +
            '</div>' +
            (state.section2Expanded ?
                '<div style="margin-top: 12px;">' +
                    '<div>' +
                        buildSlider('externalAreas', 'homeImprovement', 'Home Improvement', '+5 Enjoying projects', '-5 Pressured by repairs', getStandardSliderGradient()) +
                        buildSlider('externalAreas', 'workMoney', 'Work/Income', '+5 Calm enthusiasm', '-5 Pressure/Fear', getStandardSliderGradient()) +
                        buildSlider('externalAreas', 'moneyHandling', 'Money/Resources', '+5 Curious/planning', '-5 Fear/obsession', getStandardSliderGradient()) +
                        buildSlider('externalAreas', 'relationships', 'Personal Relationships', '+5 Able to practice tolerance', '-5 Resentments/blaming', getStandardSliderGradient()) +
                        state.customExternal.map(slider => buildCustomSlider('external', slider)).join('') +
                    '</div>' +
                    '<button class="btn" onclick="addCustomSlider(\'external\')" ' +
                            'style="background: #16a34a; color: white; width: 100%; padding: 10px; margin-top: 9px;">' +
                        '+ Add Custom Slider' +
                    '</button>' +
                '</div>'
            : '') +
        '</div>' +

        // Section 3: Known Supports
        '<div class="section-card section-teal ' + (state.section3Expanded ? 'expanded' : '') + '" ' +
             (state.section3Expanded ? '' : 'onclick="event.stopPropagation(); toggleSection(3)"') + '>' +
            '<div class="section-header">' +
                '<div>' +
                    '<div class="section-title">3. Known Supports & Stabilizers</div>' +
                    (state.section3Expanded ? '' : '<div class="section-subtitle">What\'s holding me?</div>') +
                '</div>' +
                '<button class="expand-btn" onclick="event.stopPropagation(); toggleSection(3)" style="background: #3b82f6;">' +
                    (state.section3Expanded ? 'Hide ▲' : 'Show ▼') +
                '</button>' +
            '</div>' +
            (state.section3Expanded ?
                '<div style="margin-top: 12px;">' +
                    buildSlider('supports', 'housingComforts', 'Self Care Supports', '+5 Enjoying comforts', '-5 Isolated/depleted', getBaselineSliderGradient()) +
                    buildSlider('supports', 'sleepQuality', 'Sleep Quality', '+5 Restorative sleep', '-5 Poor/no sleep', getBaselineSliderGradient()) +
                    buildSlider('supports', 'socialConnection', 'Social Connection', '+5 Connected/supported', '-5 Isolated/alone', getBaselineSliderGradient()) +
                    buildSlider('supports', 'financialCushion', 'Financial Cushion', '+5 Secure/comfortable', '-5 Precarious/stressed', getBaselineSliderGradient()) +
                    state.customSupports.map(slider => buildCustomSlider('supports', slider)).join('') +
                    '<button class="btn" onclick="addCustomSlider(\'supports\')" ' +
                            'style="background: #f97316; color: white; width: 100%; padding: 10px; margin-top: 9px;">' +
                        '+ Add Custom Slider' +
                    '</button>' +
                '</div>'
            : '') +
        '</div>' +

        // Section 4: Specific Experiences
        '<div class="section-card section-orange ' + (state.section4Expanded ? 'expanded' : '') + '" ' +
             (state.section4Expanded ? '' : 'onclick="event.stopPropagation(); toggleSection(4)"') + '>' +
            '<div class="section-header">' +
                '<div>' +
                    '<div class="section-title">4. Specific Experiences</div>' +
                    (state.section4Expanded ? '' : '<div class="section-subtitle">What needs offloading right now?</div>') +
                '</div>' +
                '<button class="expand-btn" onclick="event.stopPropagation(); toggleSection(4)" style="background: #f97316;">' +
                    (state.section4Expanded ? 'Hide ▲' : 'Show ▼') +
                '</button>' +
            '</div>' +
            (state.section4Expanded ?
                '<div style="margin-top: 12px;">' +
                    state.ambient.map(amb =>
                        '<div class="slider-container" style="position: relative;">' +
                            '<div style="display: flex; gap: 8px; align-items: flex-start; flex-wrap: wrap;">' +
                                '<div style="flex: 1; min-width: 250px;">' +
                                    '<div style="margin-bottom: 6px;">' +
                                        '<label class="input-label" style="font-size: 14px; margin: 0 0 6px 0; display: block;">What is on your mind or affecting your nerves? <span style="font-weight: normal; font-style: italic;">(Could be something supportive or soothing.)</span></label>' +
                                        '<div style="display: flex; gap: 4px;">' +
                                            '<button onclick="updateAmbient(' + amb.id + ', \'type\', \'threat\')" ' +
                                                    (amb.locked ? 'disabled' : '') + ' ' +
                                                    'style="flex: 1; padding: 6px 10px; border: 2px solid #f44336; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; ' +
                                                    (amb.type === 'threat' ? 'background: #f44336; color: white;' : 'background: white; color: #f44336;') + ' ' +
                                                    (amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
                                                'Stressor' +
                                            '</button>' +
                                            '<button onclick="updateAmbient(' + amb.id + ', \'type\', \'opportunity\')" ' +
                                                    (amb.locked ? 'disabled' : '') + ' ' +
                                                    'style="flex: 1; padding: 6px 10px; border: 2px solid #4caf50; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; ' +
                                                    (amb.type === 'opportunity' ? 'background: #4caf50; color: white;' : 'background: white; color: #4caf50;') + ' ' +
                                                    (amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
                                                'Opportunity' +
                                            '</button>' +
                                            '<button onclick="updateAmbient(' + amb.id + ', \'type\', \'regulated\')" ' +
                                                    (amb.locked ? 'disabled' : '') + ' ' +
                                                    'style="flex: 1; padding: 6px 10px; border: 2px solid #1976d2; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; ' +
                                                    (amb.type === 'regulated' ? 'background: #1976d2; color: white;' : 'background: white; color: #1976d2;') + ' ' +
                                                    (amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
                                                'Stabilizer' +
                                            '</button>' +
                                        '</div>' +
                                    '</div>' +
                                    '<textarea onchange="updateAmbient(' + amb.id + ', \'note\', this.value)" ' +
                                              'placeholder="Brief description..." ' +
                                              (amb.locked ? 'disabled' : '') + ' ' +
                                              'style="' + (amb.locked ? 'opacity: 0.6; cursor: not-allowed; background: #f3f4f6;' : '') + '">' + amb.note + '</textarea>' +
                                '</div>' +

                                '<div style="display: flex; gap: 8px; width: 100%;">' +
                                    '<div style="flex: 0 0 75%;">' +
                                        '<div class="slider-header">' +
                                            '<span class="slider-label" style="font-size: 12px;">Intensity/Loudness</span>' +
                                            '<span class="slider-value" style="color: ' + (amb.type === 'threat' ? '#f44336' : amb.type === 'regulated' ? '#1976d2' : '#4caf50') + ';">' + amb.value + '</span>' +
                                        '</div>' +
                                        '<input type="range" min="0" max="10" value="' + amb.value + '" ' +
                                               'onchange="updateAmbient(' + amb.id + ', \'value\', this.value)" ' +
                                               (amb.locked ? 'disabled' : '') + ' ' +
                                               'style="width: 100%; background: ' + getAmbientSliderGradient(amb.type) + '; ' + (amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
                                        '<div class="slider-labels">' +
                                            '<span>0 Not present</span>' +
                                            '<span>10 Very present</span>' +
                                        '</div>' +
                                    '</div>' +

                                    '<div style="display: flex; flex-direction: column; gap: 4px; align-self: center; margin-left: 10px;">' +
                                        '<button type="button" class="btn" onclick="toggleAmbientLock(' + amb.id + ')" ' +
                                                'style="padding: 4px 8px; font-size: 11px; white-space: nowrap; ' + (amb.locked ? 'background: #f59e0b; color: white;' : 'background: #3b82f6; color: white;') + '">' +
                                            (amb.locked ? 'Edit' : 'Save') +
                                        '</button>' +
                                        '<button type="button" class="btn" onclick="deleteAmbientSlider(' + amb.id + ')" ' +
                                                'style="padding: 4px 8px; font-size: 11px; white-space: nowrap; background: #dc2626; color: white;">' +
                                            'Del' +
                                        '</button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>'
                    ).join('') +
                    (state.ambient.length < 6 ?
                        '<button class="btn" onclick="addAmbientSlider()" ' +
                                (state.ambient.some(a => !a.locked) ? 'disabled ' : '') +
                                'style="background: ' + (state.ambient.some(a => !a.locked) ? '#d1d5db' : '#f97316') + '; color: white; width: 100%; padding: 10px; margin-top: 9px; ' + (state.ambient.some(a => !a.locked) ? 'cursor: not-allowed;' : '') + '">' +
                            '+ Add Topic' + (state.ambient.some(a => !a.locked) ? ' (Save current sliders first)' : '') +
                        '</button>'
                    : '<div style="text-align: center; padding: 9px; color: #6b7280; font-style: italic; font-size: 13px;">Maximum of 6 internal experiences reached</div>') +
                '</div>'
            : '') +
        '</div>' +


        '</div>' + // Close sections-grid

        // Visualization
        '<div class="card">' +
            '<h2>Window of Tolerance Visualization</h2>' +
            '<div class="visualization" id="visualization">' +
                '<div class="color-legend">' +
                    '<div style="position: absolute; top: 0; left: 0; right: 0; height: 100%; background: rgba(255, 255, 255, 0.4); border-radius: 5px; z-index: 10;"></div>' +
                    '<div style="position: absolute; top: 1.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Threat<br>Fear, Anger<br>Activated' +
                    '</div>' +
                    '<div style="position: absolute; top: 26.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Worry<br>Anxious<br>Overwhelm' +
                    '</div>' +
                    '<div style="position: absolute; top: 51.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Regulated<br>Calm<br>Grounded' +
                    '</div>' +
                    '<div style="position: absolute; top: 76.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Opportunity<br>Joy, Enthusiasm<br>Expansive' +
                    '</div>' +
                '</div>' +
                '<svg viewBox="0 0 600 300" preserveAspectRatio="none">' +
                    '<defs>' +
                        '<linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">' +
                            '<stop offset="0%" style="stop-color:#0088ff;stop-opacity:0.4" />' +
                            '<stop offset="100%" style="stop-color:#0088ff;stop-opacity:0.9" />' +
                        '</linearGradient>' +
                    '</defs>' +
                    '<path id="riverChannel" class="river-channel" d=""/>' +
                    '<path id="riverWater" class="river-water" d=""/>' +
                '</svg>' +
                '<div class="gate-top">' +
                    '<div class="gate-shape-top" id="gateShapeTop">' +
                        '<div class="gate-interior-top"></div>' +
                        '<div class="gate-outline-top"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="gate-bottom">' +
                    '<div class="gate-shape-bottom" id="gateShapeBottom">' +
                        '<div class="gate-interior-bottom"></div>' +
                        '<div class="gate-outline-bottom"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="gate-text-top" id="gateTextTop">Stress Response<br>Level: 0</div>' +
                '<div class="gate-text-bottom" id="gateTextBottom">OPPORTUNITY<br>0</div>' +
                '<div class="river-text" id="riverText">Window of Tolerance Width<br>or Internal Information<br>Processing Capacity</div>' +
            '</div>' +
        '</div>' +

        // Save button
        '<div class="card" style="border: 1px solid #16a34a;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
                '<h2 style="margin: 0;">💾 Current Entry</h2>' +
                '<button class="btn" onclick="saveEntry()" style="background: #16a34a; color: white; white-space: nowrap; padding: 10px 20px;">Save Entry</button>' +
            '</div>' +
            (state.saveError ? '<div style="color: #dc2626; margin-bottom: 12px;">' + state.saveError + '</div>' : '') +
            '<div style="display: flex; gap: 20px;">' +
                '<div style="flex: 1;">' +
                    '<div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">' +
                        'Threat: ' + getThreatLoad() + ' | Opportunity: ' + getOpportunityLoad() + ' | Regulated: ' + getRegulatedLoad() +
                    '</div>' +
                    '<div style="font-size: 14px; color: #6b7280;" id="currentPercentages">' +
                        'Calculating percentages...' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +

        // Entries
        '<div class="card">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
                '<h2 style="margin: 0;">Saved Entries: ' + state.entries.length + '</h2>' +
                '<button class="btn" style="background: #3b82f6; color: white;" onclick="copyEntries()" ' + (state.entries.length === 0 ? 'disabled style="background: #d1d5db; cursor: not-allowed;"' : '') + '>📋 Copy All</button>' +
            '</div>' +
            (state.entries.length === 0 ? '<div style="text-align: center; padding: 36px 0; color: #6b7280;">No saved entries yet</div>' : '') +
        '</div>';

    document.getElementById('app').innerHTML = html;

    const threatLoad = getThreatLoad();
    const opportunityLoad = getOpportunityLoad();
    const regulatedLoad = getRegulatedLoad();
    setTimeout(() => updateVisualization(threatLoad, opportunityLoad, regulatedLoad), 0);
}

// Initial render
render();
