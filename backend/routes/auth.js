const express = require('express');

const router = express.Router();

const mockUsers = [
  {
    officerId: 'INS-DL-1042',
    password: 'password123',
    role: 'Inspector',
    state: 'Delhi',
    district: 'South District',
    name: 'Inspector Ramesh',
    scope: 'Delhi - South District'
  },
  {
    officerId: 'AC-HR-0231',
    password: 'password123',
    role: 'Assistant Controller',
    state: 'Haryana',
    district: 'Gurgaon District',
    name: 'AC Amit Kumar',
    scope: 'Haryana - Gurgaon District'
  },
  {
    officerId: 'CTRL-TN-01',
    password: 'password123',
    role: 'Controller',
    state: 'Tamil Nadu',
    district: null,
    name: 'Controller R. Krishnan',
    scope: 'Tamil Nadu'
  },
  {
    officerId: 'DD-CEN-0088',
    password: 'password123',
    role: 'Deputy Director',
    state: null,
    district: null,
    zone: 'South Zone',
    name: 'DD Arvind Mehta',
    scope: 'South Zone'
  },
  {
    officerId: 'DIR-IND-0001',
    password: 'password123',
    role: 'Director',
    state: null,
    district: null,
    zone: null,
    name: 'Director Vikram Singh',
    scope: 'All India'
  },
  {
    officerId: 'AC-TN-CBE-01',
    password: 'demo123',
    role: 'Assistant Controller',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    name: 'AC Rajesh Kumar',
    scope: 'Coimbatore'
  },
  {
    officerId: 'DC-TN-CBE-01',
    password: 'demo123',
    role: 'Deputy Controller',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    name: 'DC Meera Krishnan',
    scope: 'Coimbatore'
  },

  {
    officerId: 'ADC-TN-CBE-01',
    password: 'demo123',
    role: 'Additional Controller',
    state: 'Tamil Nadu',
    zone: 'Coimbatore Zone',
    name: 'ADC Selvamani',
    scope: 'Coimbatore Zone'
  },
  {
    officerId: 'INS-TN-001',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Chennai',
    name: 'Inspector R. Kumar',
    scope: 'Tamil Nadu - Chennai'
  },
  {
    officerId: 'INS-TN-002',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    name: 'Inspector S. Priya',
    scope: 'Tamil Nadu - Coimbatore'
  },
  {
    officerId: 'INS-TN-003',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Cuddalore',
    name: 'Inspector M. Suresh',
    scope: 'Tamil Nadu - Cuddalore'
  },
  {
    officerId: 'INS-TN-004',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Dharmapuri',
    name: 'Inspector K. Ramesh',
    scope: 'Tamil Nadu - Dharmapuri'
  },
  {
    officerId: 'INS-TN-005',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Dindigul',
    name: 'Inspector T. Vijay',
    scope: 'Tamil Nadu - Dindigul'
  },
  {
    officerId: 'INS-TN-006',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Erode',
    name: 'Inspector P. Anand',
    scope: 'Tamil Nadu - Erode'
  },
  {
    officerId: 'INS-TN-007',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Kallakurichi',
    name: 'Inspector V. Karthik',
    scope: 'Tamil Nadu - Kallakurichi'
  },
  {
    officerId: 'INS-TN-008',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Kanchipuram',
    name: 'Inspector N. Lakshmi',
    scope: 'Tamil Nadu - Kanchipuram'
  },
  {
    officerId: 'INS-TN-009',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Kanyakumari',
    name: 'Inspector G. Prakash',
    scope: 'Tamil Nadu - Kanyakumari'
  },
  {
    officerId: 'INS-TN-010',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Karur',
    name: 'Inspector D. Shankar',
    scope: 'Tamil Nadu - Karur'
  },
  {
    officerId: 'INS-TN-011',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Krishnagiri',
    name: 'Inspector A. Meena',
    scope: 'Tamil Nadu - Krishnagiri'
  },
  {
    officerId: 'INS-TN-012',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Madurai',
    name: 'Inspector R. Arumugam',
    scope: 'Tamil Nadu - Madurai'
  },
  {
    officerId: 'INS-TN-013',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Mayiladuthurai',
    name: 'Inspector C. Balaji',
    scope: 'Tamil Nadu - Mayiladuthurai'
  },
  {
    officerId: 'INS-TN-014',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Nagapattinam',
    name: 'Inspector S. Mahesh',
    scope: 'Tamil Nadu - Nagapattinam'
  },
  {
    officerId: 'INS-TN-015',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Namakkal',
    name: 'Inspector B. Venkatesh',
    scope: 'Tamil Nadu - Namakkal'
  },
  {
    officerId: 'INS-TN-016',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Nilgiris',
    name: 'Inspector K. Srinivasan',
    scope: 'Tamil Nadu - Nilgiris'
  },
  {
    officerId: 'INS-TN-017',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Perambalur',
    name: 'Inspector M. Prabhu',
    scope: 'Tamil Nadu - Perambalur'
  },
  {
    officerId: 'INS-TN-018',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Pudukkottai',
    name: 'Inspector T. Ravi',
    scope: 'Tamil Nadu - Pudukkottai'
  },
  {
    officerId: 'INS-TN-019',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Ramanathapuram',
    name: 'Inspector V. Ganesh',
    scope: 'Tamil Nadu - Ramanathapuram'
  },
  {
    officerId: 'INS-TN-020',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Ranipet',
    name: 'Inspector P. Rajan',
    scope: 'Tamil Nadu - Ranipet'
  },
  {
    officerId: 'INS-TN-021',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Salem',
    name: 'Inspector R. Swaminathan',
    scope: 'Tamil Nadu - Salem'
  },
  {
    officerId: 'INS-TN-022',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Sivaganga',
    name: 'Inspector N. Murugan',
    scope: 'Tamil Nadu - Sivaganga'
  },
  {
    officerId: 'INS-TN-023',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Tenkasi',
    name: 'Inspector S. Saravanan',
    scope: 'Tamil Nadu - Tenkasi'
  },
  {
    officerId: 'INS-TN-024',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Thanjavur',
    name: 'Inspector K. Balamurugan',
    scope: 'Tamil Nadu - Thanjavur'
  },
  {
    officerId: 'INS-TN-025',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Theni',
    name: 'Inspector V. Ramasamy',
    scope: 'Tamil Nadu - Theni'
  },
  {
    officerId: 'INS-TN-026',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Thoothukudi',
    name: 'Inspector M. Senthil',
    scope: 'Tamil Nadu - Thoothukudi'
  },
  {
    officerId: 'INS-TN-027',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Tiruchirappalli',
    name: 'Inspector P. Kannan',
    scope: 'Tamil Nadu - Tiruchirappalli'
  },
  {
    officerId: 'INS-TN-028',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Tirunelveli',
    name: 'Inspector T. Selvam',
    scope: 'Tamil Nadu - Tirunelveli'
  },
  {
    officerId: 'INS-TN-029',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Tirupathur',
    name: 'Inspector R. Mani',
    scope: 'Tamil Nadu - Tirupathur'
  },
  {
    officerId: 'INS-TN-030',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Tiruppur',
    name: 'Inspector S. Loganathan',
    scope: 'Tamil Nadu - Tiruppur'
  },
  {
    officerId: 'INS-TN-031',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Tiruvallur',
    name: 'Inspector K. Sivakumar',
    scope: 'Tamil Nadu - Tiruvallur'
  },
  {
    officerId: 'INS-TN-032',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Tiruvannamalai',
    name: 'Inspector M. Ganesan',
    scope: 'Tamil Nadu - Tiruvannamalai'
  },
  {
    officerId: 'INS-TN-033',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Tiruvarur',
    name: 'Inspector V. Kumar',
    scope: 'Tamil Nadu - Tiruvarur'
  },
  {
    officerId: 'INS-TN-034',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Vellore',
    name: 'Inspector P. Raja',
    scope: 'Tamil Nadu - Vellore'
  },
  {
    officerId: 'INS-TN-035',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Viluppuram',
    name: 'Inspector N. Sankar',
    scope: 'Tamil Nadu - Viluppuram'
  },
  {
    officerId: 'INS-TN-036',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Virudhunagar',
    name: 'Inspector S. Jeyakumar',
    scope: 'Tamil Nadu - Virudhunagar'
  },
  {
    officerId: 'INS-TN-037',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Chengalpattu',
    name: 'Inspector R. Krishnan',
    scope: 'Tamil Nadu - Chengalpattu'
  },
  {
    officerId: 'INS-TN-038',
    password: 'demo123',
    role: 'Inspector',
    state: 'Tamil Nadu',
    district: 'Ariyalur',
    name: 'Inspector T. Velmurugan',
    scope: 'Tamil Nadu - Ariyalur'
  }
];

router.post('/login', (req, res) => {
  const { officerId, password, role, state, district, zone } = req.body;

  // Simple mock validation. We just check if they provided credentials
  // In a real app we'd verify the password and check DB
  if (!officerId || !password || !role) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  // Check if it's one of our mock users
  const user = mockUsers.find(u => u.officerId === officerId);
  
  const token = `dummy-token-${Math.random().toString(36).substr(2, 9)}`;

  if (user) {
    // If it's a mock user, return their predefined data (ignoring form selections to simplify demo)
    return res.json({ ...user, token });
  }

  // Fallback: If they typed a custom user, construct a mock response based on form fields
  let scope = 'All India';
  if (state && district) {
    scope = `${state} - ${district}`;
  } else if (state) {
    scope = state;
  } else if (zone) {
    scope = zone;
  }

  res.json({
    officerId,
    role,
    state,
    district,
    zone,
    name: `Officer ${officerId}`,
    scope,
    token
  });
});

module.exports = router;
