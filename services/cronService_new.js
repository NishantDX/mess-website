const cron = require("node-cron");
const axios = require("axios");

class CronService {
  constructor() {
    this.baseURL = process.env.BASE_URL || "http://localhost:5000";
    this.studentId = "231220041";
    this.dailyMealPlan = null; // Will store today's meal plan
    this.lastPlanDate = null; // Track when plan was last generated
  }

  /**
   * Get random meal type
   */
  getRandomMeal() {
    const meals = ["breakfast", "lunch", "dinner"];
    return meals[Math.floor(Math.random() * meals.length)];
  }

  /**
   * Generate random meal plan for the day
   * Returns array of meals to attend (1-3 meals randomly selected)
   */
  generateDailyMealPlan() {
    const allMeals = ["breakfast", "lunch", "dinner"];
    const numberOfMeals = Math.floor(Math.random() * 3) + 1; // 1-3 meals

    // Shuffle array and take first numberOfMeals
    const shuffled = [...allMeals].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numberOfMeals);
  }

  /**
   * Get today's meal plan (generates new one if needed)
   */
  getTodaysMealPlan() {
    const today = this.getCurrentDate();

    // Generate new plan if it's a new day or no plan exists
    if (this.lastPlanDate !== today || !this.dailyMealPlan) {
      this.dailyMealPlan = this.generateDailyMealPlan();
      this.lastPlanDate = today;
      console.log(`📋 New daily meal plan for ${today}:`, this.dailyMealPlan);
    }

    return this.dailyMealPlan;
  }

  /**
   * Check if a specific meal is in today's plan
   */
  isMealInTodaysPlan(mealType) {
    const todaysPlan = this.getTodaysMealPlan();
    return todaysPlan.includes(mealType);
  }

  /**
   * Get random number of calls (1-3)
   */
  getRandomCallCount() {
    return Math.floor(Math.random() * 3) + 1;
  }

  /**
   * Get current date in YYYY-MM-DD format
   */
  getCurrentDate() {
    return new Date().toISOString().split("T")[0];
  }

  /**
   * Mark attendance for a random meal from today's plan
   */
  async markRandomAttendance() {
    try {
      const todaysPlan = this.getTodaysMealPlan();
      const meal = todaysPlan[Math.floor(Math.random() * todaysPlan.length)];
      const currentDate = this.getCurrentDate();

      const response = await axios.post(
        `${this.baseURL}/api/attendance/internal`,
        {
          student_id: this.studentId,
          date: currentDate,
          attendance: meal,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        `✅ Successfully marked ${meal} attendance for student ${this.studentId} on ${currentDate}`
      );
      console.log("Response:", response.data);

      return { success: true, meal, date: currentDate };
    } catch (error) {
      if (error.response) {
        console.log(
          `⚠️ Error marking attendance: ${error.response.data.message}`
        );
        return { success: false, error: error.response.data.message };
      } else {
        console.error("❌ Network error:", error.message);
        return { success: false, error: error.message };
      }
    }
  }

  /**
   * Execute random number of attendance markings (only for today's planned meals)
   */
  async executeRandomAttendanceMarkings() {
    const todaysPlan = this.getTodaysMealPlan();
    const callCount = this.getRandomCallCount();
    console.log(
      `🎲 Making ${callCount} random attendance calls for today's meals:`,
      todaysPlan
    );

    const results = [];

    for (let i = 0; i < callCount; i++) {
      const result = await this.markRandomAttendance();
      results.push(result);

      // Add a small delay between calls to avoid overwhelming the server
      if (i < callCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const successful = results.filter((r) => r.success).length;
    console.log(`📊 Completed ${callCount} attempts, ${successful} successful`);

    return results;
  }

  /**
   * Execute attendance marking for a specific meal type (only if in today's plan)
   */
  async executeSpecificMealAttendance(mealType) {
    if (!this.isMealInTodaysPlan(mealType)) {
      console.log(`🚫 ${mealType} not in today's meal plan. Skipping...`);
      return [];
    }

    console.log(
      `🍽️ ${mealType} is in today's plan. Executing attendance marking...`
    );
    const callCount = this.getRandomCallCount();
    const results = [];

    for (let i = 0; i < callCount; i++) {
      try {
        const currentDate = this.getCurrentDate();
        const response = await axios.post(
          `${this.baseURL}/api/attendance/internal`,
          {
            student_id: this.studentId,
            date: currentDate,
            attendance: mealType,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log(`✅ Successfully marked ${mealType} attendance`);
        results.push({ success: true, meal: mealType, date: currentDate });
      } catch (error) {
        if (error.response) {
          console.log(
            `⚠️ Error marking ${mealType} attendance: ${error.response.data.message}`
          );
          results.push({ success: false, error: error.response.data.message });
        } else {
          console.error("❌ Network error:", error.message);
          results.push({ success: false, error: error.message });
        }
      }

      // Add delay between calls
      if (i < callCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Start the cron jobs
   */
  startCronJobs() {
    console.log("🚀 Starting attendance cron jobs...");

    // Generate initial meal plan for today
    this.getTodaysMealPlan();

    // Breakfast: 7-9 AM (only if breakfast is in today's plan)
    cron.schedule("0 7-9 * * *", async () => {
      console.log(
        "\n🍳 Breakfast time cron triggered at:",
        new Date().toLocaleString()
      );
      await this.executeSpecificMealAttendance("breakfast");
    });

    // Lunch: 12-2 PM (only if lunch is in today's plan)
    cron.schedule("0 12-14 * * *", async () => {
      console.log(
        "\n🍽️ Lunch time cron triggered at:",
        new Date().toLocaleString()
      );
      await this.executeSpecificMealAttendance("lunch");
    });

    // Dinner: 7-9 PM (only if dinner is in today's plan)
    cron.schedule("0 19-21 * * *", async () => {
      console.log(
        "\n🍽️ Dinner time cron triggered at:",
        new Date().toLocaleString()
      );
      await this.executeSpecificMealAttendance("dinner");
    });

    // Random times throughout the day (uses random meals from today's plan)
    cron.schedule("0 6,9,15,18 * * *", async () => {
      console.log(
        "\n🎲 Random cron triggered at:",
        new Date().toLocaleString()
      );
      await this.executeRandomAttendanceMarkings();
    });

    // Daily plan reset at midnight (generates new meal plan for the new day)
    cron.schedule("0 0 * * *", () => {
      console.log("\n🌅 New day! Generating fresh meal plan...");
      this.dailyMealPlan = null; // Reset plan
      this.getTodaysMealPlan(); // Generate new plan
    });

    // For testing: run every 2 minutes (UNCOMMENT FOR TESTING ONLY)
    // cron.schedule('*/2 * * * *', async () => {
    //   console.log('\n🧪 Test cron triggered at:', new Date().toLocaleString());
    //   await this.executeRandomAttendanceMarkings();
    // });

    console.log("✅ Cron jobs scheduled successfully!");
    console.log("📅 Schedule Overview:");
    console.log("   - Breakfast: 7-9 AM (only if selected for the day)");
    console.log("   - Lunch: 12-2 PM (only if selected for the day)");
    console.log("   - Dinner: 7-9 PM (only if selected for the day)");
    console.log("   - Random: 6 AM, 9 AM, 3 PM, 6 PM (from daily meal plan)");
    console.log(
      "   - Plan Reset: Midnight (generates new daily meal combination)"
    );
  }

  /**
   * Test the attendance marking manually
   */
  async testAttendanceMarking() {
    console.log("🧪 Testing attendance marking...");
    const results = await this.executeRandomAttendanceMarkings();
    return results;
  }
}

module.exports = CronService;
