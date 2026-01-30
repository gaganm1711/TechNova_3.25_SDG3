/**
 * Vitals Monitoring Service
 * Real-time IoT vital signs and AI health assessment
 */

// Simulate IoT device vitals with realistic patterns
export class VitalsMonitor {
  constructor(patientId) {
    this.patientId = patientId;
    this.baseVitals = {
      heartRate: 72,
      systolicBP: 120,
      diastolicBP: 80,
      oxygenSaturation: 98,
      temperature: 37,
      respiratoryRate: 16
    };
    this.currentVitals = { ...this.baseVitals };
    this.vitalsHistory = [];
    this.criticalAlerts = [];
    this.startTime = Date.now();
  }

  // Simulate vitals changes based on stress/emergency
  updateVitals(stressLevel = 0) {
    // stressLevel: 0-1 (0=calm, 1=critical emergency)
    const variance = (Math.random() - 0.5) * 2;
    
    this.currentVitals = {
      heartRate: Math.max(40, Math.min(180, this.baseVitals.heartRate + stressLevel * 50 + variance * 10)),
      systolicBP: Math.max(80, Math.min(200, this.baseVitals.systolicBP + stressLevel * 40 + variance * 8)),
      diastolicBP: Math.max(50, Math.min(130, this.baseVitals.diastolicBP + stressLevel * 30 + variance * 5)),
      oxygenSaturation: Math.max(85, Math.min(100, this.baseVitals.oxygenSaturation - stressLevel * 10 + variance * 2)),
      temperature: Math.max(36, Math.min(40, this.baseVitals.temperature + stressLevel * 2 + variance * 0.5)),
      respiratoryRate: Math.max(12, Math.min(40, this.baseVitals.respiratoryRate + stressLevel * 15 + variance * 3))
    };

    // Store history
    this.vitalsHistory.push({
      timestamp: Date.now(),
      ...this.currentVitals
    });

    // Check for critical alerts
    this.checkCriticalAlerts();

    return this.currentVitals;
  }

  checkCriticalAlerts() {
    const alerts = [];
    const { heartRate, oxygenSaturation, systolicBP } = this.currentVitals;

    if (heartRate > 130) alerts.push({ type: 'TACHYCARDIA', severity: 'HIGH', value: heartRate });
    if (heartRate < 50) alerts.push({ type: 'BRADYCARDIA', severity: 'CRITICAL', value: heartRate });
    if (oxygenSaturation < 90) alerts.push({ type: 'HYPOXIA', severity: 'CRITICAL', value: oxygenSaturation });
    if (systolicBP > 180) alerts.push({ type: 'HYPERTENSION_CRISIS', severity: 'HIGH', value: systolicBP });
    if (systolicBP < 90) alerts.push({ type: 'HYPOTENSION', severity: 'CRITICAL', value: systolicBP });

    this.criticalAlerts = alerts;
    return alerts;
  }

  // Calculate severity score (0-100)
  calculateSeverityScore() {
    const { heartRate, oxygenSaturation, systolicBP } = this.currentVitals;
    let score = 0;

    // Heart rate scoring
    if (heartRate > 130 || heartRate < 50) score += 30;
    else if (heartRate > 100 || heartRate < 60) score += 15;

    // Oxygen scoring
    if (oxygenSaturation < 90) score += 35;
    else if (oxygenSaturation < 94) score += 15;

    // Blood pressure scoring
    if (systolicBP > 180 || systolicBP < 90) score += 25;
    else if (systolicBP > 160 || systolicBP < 100) score += 10;

    // Temperature scoring
    if (this.currentVitals.temperature > 39 || this.currentVitals.temperature < 35) score += 10;

    return Math.min(100, score);
  }

  // AI-based condition assessment
  assessCondition() {
    const severity = this.calculateSeverityScore();
    const alerts = this.criticalAlerts;
    const vitals = this.currentVitals;

    let condition = 'STABLE';
    let recommendedSpecialty = 'GENERAL';

    if (severity > 70) {
      condition = 'CRITICAL';
      recommendedSpecialty = 'ICU';
      
      if (alerts.some(a => a.type === 'HYPOXIA')) recommendedSpecialty = 'RESPIRATORY_ICU';
      if (alerts.some(a => a.type.includes('CARDIO'))) recommendedSpecialty = 'CARDIOLOGY';
    } else if (severity > 40) {
      condition = 'SERIOUS';
      recommendedSpecialty = 'EMERGENCY';
    } else {
      condition = 'STABLE';
      recommendedSpecialty = 'GENERAL';
    }

    return {
      condition,
      severity,
      recommendedSpecialty,
      alerts,
      vitals
    };
  }

  // Get vitals trend (improving/declining)
  getTrend() {
    if (this.vitalsHistory.length < 2) return 'STABLE';
    
    const recent = this.vitalsHistory.slice(-5);
    const scores = recent.map(v => {
      let s = 0;
      if (v.heartRate > 100 || v.heartRate < 60) s += 20;
      if (v.oxygenSaturation < 94) s += 30;
      if (v.systolicBP > 160 || v.systolicBP < 100) s += 50;
      return s;
    });

    const trend = scores[scores.length - 1] - scores[0];
    if (trend > 10) return 'DECLINING';
    if (trend < -10) return 'IMPROVING';
    return 'STABLE';
  }
}

// AI Hospital Recommendation Engine
export function recommendHospital(hospitals, patientCondition, patientAge, patientVitals) {
  const recommendations = hospitals.map(hospital => {
    let score = 100;

    // Distance scoring (closer is better)
    const distanceScore = Math.max(0, 100 - hospital.distance * 10);
    score += distanceScore * 0.2;

    // Bed availability scoring
    let bedsNeeded = 1;
    if (patientCondition.severity > 70) bedsNeeded = 1; // ICU bed
    if (patientCondition.severity > 40) bedsNeeded = 1; // Emergency bed
    
    const hasCapacity = hospital.generalBeds > 0;
    if (!hasCapacity) score -= 50;

    // Specialty matching
    const specialties = {
      'CARDIOLOGY': ['AIIMS Nagpur', 'Apollo Hospitals', 'Fortis Hospital'],
      'RESPIRATORY_ICU': ['AIIMS Nagpur', 'Disha Hospital'],
      'TRAUMA': ['AIIMS Nagpur', 'Fortis Hospital'],
      'GENERAL': ['Lifeline Hospital', 'Disha Hospital']
    };

    const requiredSpecialty = patientCondition.recommendedSpecialty;
    if (specialties[requiredSpecialty]?.includes(hospital.name)) {
      score += 30;
    }

    // ICU bed availability for critical patients
    if (patientCondition.severity > 70 && hospital.icuBeds > 0) {
      score += 25;
    } else if (patientCondition.severity > 70 && hospital.icuBeds === 0) {
      score -= 40;
    }

    // Emergency bed availability for emergency patients
    if (patientCondition.severity > 40 && hospital.emergencyBeds > 0) {
      score += 20;
    }

    // Previous success rate (simulated)
    score += hospital.successRate || 85;

    return {
      hospitalId: hospital.hospitalId,
      name: hospital.name,
      distance: hospital.distance,
      recommendation: score,
      specialty: requiredSpecialty,
      reason: getReason(requiredSpecialty, hospital)
    };
  });

  // Sort by recommendation score
  return recommendations.sort((a, b) => b.recommendation - a.recommendation);
}

function getReason(specialty, hospital) {
  const reasons = {
    'CARDIOLOGY': `Specialized Cardiology unit - ideal for cardiac emergency`,
    'RESPIRATORY_ICU': `Advanced respiratory care with ECMO capability`,
    'ICU': `Well-equipped ICU with multiple critical care beds`,
    'EMERGENCY': `Rapid emergency response team on standby`,
    'TRAUMA': `Trauma center with emergency surgery facilities`,
    'GENERAL': `General medical facility with good stabilization capacity`
  };
  return reasons[specialty] || 'Suitable for patient condition';
}

// Export vitals assessment API call
export async function submitVitalsUpdate(patientId, vitals, condition) {
  try {
    const response = await fetch('http://127.0.0.1:8002/patient/vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patientId,
        vitals,
        condition,
        timestamp: new Date().toISOString()
      })
    });
    return await response.json();
  } catch (err) {
    console.error('Vitals submission failed:', err);
    throw err;
  }
}
