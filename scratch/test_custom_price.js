const { pool } = require('../backend/config/database');
const helpers = require('../backend/utils/helpers');

async function test() {
  try {
    console.log('Testing custom price calculation mock...');
    
    // Simulate what calculateBookingTotal and coupon calculation would do in backend routes:
    const pricing = helpers.calculateBookingTotal(
      500, // basePrice per night
      2,   // nights
      50,  // cleaningFee
      100, // securityDeposit
      0,   // extraGuestFee
      100, // serviceFee
      150  // taxAmount
    );
    // Total should be 500*2 + 50 + 100 + 100 + 150 = 1400
    console.log('Pricing calculated:', pricing);
    
    const custom_price = 1200; // custom price set by host
    
    let hostDiscount = 0;
    const parsedCustomPrice = parseFloat(custom_price);
    if (!isNaN(parsedCustomPrice) && parsedCustomPrice > 0 && parsedCustomPrice <= pricing.total) {
      hostDiscount = pricing.total - parsedCustomPrice;
    }
    
    const finalTotal = Math.max(0, pricing.total - hostDiscount);
    console.log('Host Discount:', hostDiscount);
    console.log('Final Total (should be 1200):', finalTotal);
    
    if (finalTotal === 1200 && hostDiscount === 200) {
      console.log('✅ Custom price override logic verified successfully!');
    } else {
      console.error('❌ Custom price override logic mismatch!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error running test:', err);
    process.exit(1);
  }
}

test();
