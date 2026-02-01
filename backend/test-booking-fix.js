const { isValidDateRange, isPastDate } = require('./utils/helpers');

// Test the fixed date validation
function testFixedValidation() {
  console.log('\n🔧 Testing Fixed Date Validation\n');
  
  // Test cases that were failing
  const testCases = [
    {
      name: 'Empty strings (should be invalid)',
      checkIn: '',
      checkOut: '',
      expected: false
    },
    {
      name: 'Null values (should be invalid)',
      checkIn: null,
      checkOut: null,
      expected: false
    },
    {
      name: 'Undefined values (should be invalid)',
      checkIn: undefined,
      checkOut: undefined,
      expected: false
    },
    {
      name: 'Valid dates (should be valid)',
      checkIn: '2025-10-25',
      checkOut: '2025-10-27',
      expected: true
    },
    {
      name: 'Same dates (should be invalid)',
      checkIn: '2025-10-25',
      checkOut: '2025-10-25',
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
  console.log('\n📅 Testing Fixed Past Date Function\n');
  
  const pastTests = [
    { date: '', expected: true, name: 'Empty string' },
    { date: null, expected: true, name: 'Null' },
    { date: undefined, expected: true, name: 'Undefined' },
    { date: '2024-01-01', expected: true, name: 'Past date' },
    { date: '2025-12-31', expected: false, name: 'Future date' }
  ];
  
  pastTests.forEach((test, index) => {
    const result = isPastDate(test.date);
    const status = result === test.expected ? '✅' : '❌';
    
    console.log(`${index + 1}. ${test.name}`);
    console.log(`   Date: ${test.date}`);
    console.log(`   Expected: ${test.expected}, Got: ${result} ${status}`);
    console.log('');
  });
}

testFixedValidation();


