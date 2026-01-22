# n8n Daily Health Reports Workflow

## 📧 What This Does
Sends a daily health summary email to all users who have completed a physical health assessment.

---

## 🔧 Workflow Setup

### **Node 1: Schedule Trigger**
- **Type**: Schedule Trigger
- **Trigger Interval**: Every Day
- **Trigger Time**: 09:00 (9 AM)
- **Timezone**: Your local timezone

---

### **Node 2: HTTP Request - Get All Users**
- **Type**: HTTP Request
- **Method**: GET
- **URL**: `https://your-ngrok-url.ngrok-free.dev/health/users/all`
- **Authentication**: None
- **Options**: 
  - Response Format: JSON

**What it returns:**
```json
[
  {
    "user_id": "abc123",
    "email": "user@example.com",
    "latest_assessment": {
      "bmi": 22.5,
      "bmi_category": "Normal weight",
      "weight": 70,
      "height": 175,
      "age": 25,
      "assessed_at": "2026-01-23T09:00:00"
    }
  }
]
```

---

### **Node 3: Split Out Items** (Optional but recommended)
- **Type**: Item Lists
- **Operation**: Split Out Items
- **Field to Split Out**: Leave empty (already an array)

This ensures each user gets processed individually.

---

### **Node 4: Gmail - Send Health Report**
- **Type**: Gmail
- **Operation**: Send
- **Resource**: Message

**Configuration:**
- **To**: `{{ $json.email }}`
- **Subject**: `Your Daily Health Summary - Mindwave AI`
- **Email Type**: HTML
- **Message**:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Your Daily Health Summary</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #333;">Hello!</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Here's your latest health assessment from Mindwave AI:
        </p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #FF6B35; margin-top: 0;">📊 Your Metrics</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>BMI:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{ $json.latest_assessment.bmi }}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Category:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <span style="background: #4CAF50; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                            {{ $json.latest_assessment.bmi_category }}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Weight:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{ $json.latest_assessment.weight }} kg</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Height:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{ $json.latest_assessment.height }} cm</td>
                </tr>
                <tr>
                    <td style="padding: 10px;"><strong>Last Updated:</strong></td>
                    <td style="padding: 10px;">{{ $json.latest_assessment.assessed_at.split('T')[0] }}</td>
                </tr>
            </table>
        </div>
        
        <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; border-left: 4px solid #FF6B35;">
            <h3 style="color: #FF6B35; margin-top: 0;">💡 Health Tip of the Day</h3>
            <p style="color: #666; margin: 0;">
                Stay hydrated! Aim for 8 glasses of water daily to maintain optimal health and energy levels.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/physical-health" 
               style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
                Update Your Assessment
            </a>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>This is an automated health report from Mindwave AI</p>
        <p>© 2026 Mindwave AI. All rights reserved.</p>
    </div>
</div>
```

---

## 🎨 Email Preview

The email will show:
- ✅ User's current BMI
- ✅ BMI Category (color-coded)
- ✅ Weight and Height
- ✅ Last assessment date
- ✅ Daily health tip
- ✅ Button to update assessment

---

## ⚙️ Advanced Options

### **Add Filtering (Optional)**
After "Split Out Items", add an **IF** node:
- **Condition**: `{{ $json.latest_assessment.bmi }}` is greater than `0`
- This filters out users with no data

### **Personalize Health Tips**
You can add a **Code** node to generate personalized tips based on BMI:

```javascript
// Personalized health tip based on BMI
const bmi = $input.item.json.latest_assessment.bmi;
let tip = "";

if (bmi < 18.5) {
  tip = "Consider consulting a nutritionist to develop a healthy weight gain plan.";
} else if (bmi >= 18.5 && bmi < 25) {
  tip = "Great job! Maintain your healthy weight with regular exercise and balanced nutrition.";
} else if (bmi >= 25 && bmi < 30) {
  tip = "Consider incorporating 30 minutes of daily exercise and reducing processed foods.";
} else {
  tip = "We recommend consulting a healthcare provider for personalized weight management guidance.";
}

return { 
  ...$ input.item.json,
  health_tip: tip
};
```

Then use `{{ $json.health_tip }}` in the email.

---

## 🚀 Testing

1. **Test the API first:**
   ```bash
   curl http://localhost:8000/health/users/all
   ```

2. **Execute the workflow manually** in n8n (click "Execute Workflow")

3. **Check your inbox** for the test email

4. **Activate the workflow** for daily automation

---

## 📊 Monitoring

### Track Email Success:
- Add an **Error Trigger** node to catch failures
- Log successful sends to a Google Sheet
- Set up Slack notifications for errors

---

## 🔐 Security Notes

- Use **Gmail OAuth2** (not app passwords)
- Store credentials securely in n8n
- Never hardcode API keys
- Use environment variables for URLs

---

## 📈 Future Enhancements

1. **Weekly Summary**: Change trigger to weekly, include BMI trends
2. **Conditional Alerts**: Only email if BMI changed significantly
3. **Multi-language**: Detect user language and send localized emails
4. **PDF Reports**: Generate and attach PDF health reports

---

Your daily health report system is ready! 🎉
