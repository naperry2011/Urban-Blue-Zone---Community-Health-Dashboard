# Urban Blue Zone IoT Simulator

This simulator generates realistic IoT data for testing the Urban Blue Zone system.

## Features

- Simulates 5 resident profiles with different demographics and health conditions
- Generates realistic vital signs with natural variations
- Simulates Blue Zone habit check-ins across 5 categories
- Supports manual alert scenario testing
- Interactive command-line interface

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up IoT certificates:
   - Create a `certs/` directory
   - Add your IoT device certificates:
     - `private.pem.key`
     - `certificate.pem.crt`
     - `AmazonRootCA1.pem`

3. Configure environment variables:
   ```bash
   export IOT_ENDPOINT="your-iot-endpoint.iot.us-east-1.amazonaws.com"
   export IOT_CLIENT_ID="simulator-001"
   ```

## Usage

Start the simulator:
```bash
npm start
```

### Interactive Commands

While running, you can use these commands:

- `status` - Show simulator status
- `alert <residentId> <scenario>` - Trigger alert scenarios
- `help` - Show available commands

### Alert Scenarios

Test different alert conditions:

```bash
# High blood pressure
alert resident-001 high_bp

# Critical blood pressure
alert resident-001 critical_bp

# Low oxygen saturation
alert resident-004 low_oxygen

# High temperature
alert resident-002 high_temp
```

## Resident Profiles

The simulator includes these test residents:

1. **resident-001** - John Smith (72, Senior, Hypertension)
2. **resident-002** - Mary Johnson (45, Adult, Diabetes)
3. **resident-003** - Alex Chen (16, Teen, Healthy)
4. **resident-004** - Robert Davis (68, Senior, COPD)
5. **resident-005** - Linda Wilson (52, Adult, Hypertension + Diabetes)

## Data Generation

### Vital Signs
- Blood pressure with realistic variations
- Heart rate based on age and conditions
- Body temperature with normal fluctuations
- Oxygen saturation with condition-based variations

### Habit Check-ins
- **Move Naturally**: Steps, active minutes, distance
- **Right Tribe**: Social interactions, meaningful connections
- **Plant Slant**: Plant-based meals, vegetable servings
- **Downshift**: Stress levels, meditation, relaxation
- **Purpose**: Purpose rating, volunteer hours, goal progress

## MQTT Topics

- Vitals: `urban-blue-zone/vitals/{residentId}`
- Check-ins: `urban-blue-zone/checkins/{residentId}`