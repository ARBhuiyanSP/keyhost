const { isValidDateRange, isPastDate } = require('./utils/helpers');

// Test date validation functions
function testDateValidation() {
  console.log('\n🧪 Testing Date Validation Functions\n');
  
  // Test cases
  const testCases = [
    {
      name: 'Valid dates (check-out after check-in)',
      checkIn: '2025-10-25',
      checkOut: '2025-10-27',
      expected: true
    },
    {
      name: 'Same dates (invalid)',
      checkIn: '2025-10-25',
      checkOut: '2025-10-25',
      expected: false
    },
    {
      name: 'Check-out before check-in (invalid)',
      checkIn: '2025-10-27',
      checkOut: '2025-10-25',
      expected: false
    },
    {
      name: 'Empty dates (invalid)',
      checkIn: '',
      checkOut: '',
      expected: false
    },
    {
      name: 'Null dates (invalid)',
      checkIn: null,
      checkOut: null,
      expected: false
    },
    {
      name: 'Undefined dates (invalid)',
      checkIn: undefined,
      checkOut: undefined,
      expected: false
    },
    {
      name: 'Invalid date format (invalid)',
      checkIn: 'invalid-date',
      checkOut: 'invalid-date',
      expected: false
    }
  ];
  
  testCases.forEach((testCase, index) => {
    const result = isValidDateRange(testCase.checkIn, testCase.checkOut);
    const status = result === testCase.expected ? '✅' : '❌';
    
    console.log(`${index + 1}. ${testCase.name}`);
    console.log(`   Check-in: ${testCase.checkIn}`);
    console.log(`   Check-out: ${testCase.checkOut}`);
    console.log(`   Expected: ${testCase.expected}, Got: ${result} ${status}`);
    console.log('');
  });
  
  // Test past date function
  console.log('\n📅 Testing Past Date Function\n');
  
  const pastDateTests = [
    { date: '2024-01-01', expected: true, name: 'Past date' },
    { date: '2025-12-31', expected: false, name: 'Future date' },
    { date: new Date().toISOString().split('T')[0], expected: false, name: 'Today' },
    { date: '', expected: true, name: 'Empty string' },
    { date: null, expected: true, name: 'Null' },
    { date: undefined, expected: true, name: 'Undefined' }
  ];
  
  pastDateTests.forEach((test, index) => {
    const result = isPastDate(test.date);
    const status = result === test.expected ? '✅' : '❌';
    
    console.log(`${index + 1}. ${test.name}`);
    console.log(`   Date: ${test.date}`);
    console.log(`   Expected: ${test.expected}, Got: ${result} ${status}`);
    console.log('');
  });
}

testDateValidation();


