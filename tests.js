var specimens = {}

specimens['blood'] = ['Full blood count', 'Malaria (mRDT)', 'Malaria (Microscopy)',
    'Group and Cross match', 'Urea and electrolytes', 'CD4(cluster of differentiation 4) count',
    'Viral load', 'Cryptococcal Antigen', 'Lactate', 'Fasting blood sugar', 'Random blood sugar',
    'Liver function test', 'Hepatitis test', 'sickling test', 'ESR(erythrocyte sedimentation rate)',
    'Culture and sensitivity', 'Widal test', 'ELISA(enzyme-linked immunosorbent assay)',
    'ASO(Antistreptoysin-0) titre', 'Rheumatoid factor', 'Cholesterol', 'Tryglicerides', 'Calcium',
    'Creatinine', 'VDRL(venereal disease research laboratory)', 'Direct Coombs', 'Indirect Coombs',
    'Blood Test NOS'
];

specimens['csf'] = ['Full CSF analysis', 'Indian ink', 'Protein and Sugar', 'White cell count',
    'Culture and sensitivity'];

specimens['urine'] = ['Urine microscopy', 'Urinalysis', 'Culture and sensitivity']

specimens['aspirate'] = ['Full aspirate analysis'];

specimens['sputum'] = ['AAFB (1st)', 'AAFB (2nd)', 'AAFB (3rd)'];

specimens['stool'] = ['Full stool analysis', 'Culture and sensitivity'];

specimens['swab'] = ['Microscopy', 'Culture and sensitivity'];

specimens["short_names"] = {
    'Full blood count': 'FBC',
    'Malaria (mRDT)': 'MP',
    'Malaria (Microscopy)': 'MP',
    'Group and Cross match': 'G/XM',
    'Urea and electrolytes': 'Urea and electrolytes',
    'CD4(cluster of differentiation 4) count': 'CD4',
    'Viral load': 'Viral Load',
    'Cryptococcal Antigen': 'Cryptococcal Antigen',
    'Lactate': 'Lactate',
    'Fasting blood sugar': 'FBS',
    'Random blood sugar': 'RBS',
    'Liver function test': 'LFT',
    'Hepatitis test': 'Hep',
    'sickling test': 'sickle',
    'ESR(erythrocyte sedimentation rate)': 'ESR',
    'Culture and sensitivity': 'C_S',
    'Widal test': 'Widal',
    'ELISA(enzyme-linked immunosorbent assay)': 'ELISA',
    'ASO(Antistreptoysin-0) titre': 'ASO',
    'Rheumatoid factor': 'Rheumatoid',
    'Cholesterol': 'Cholesterol',
    'Tryglicerides': 'Tryglicerides',
    'Calcium': 'Ca',
    'Creatinine': 'Creat',
    'VDRL(venereal disease research laboratory)': 'VDRL',
    'Direct Coombs': 'D/Coombs',
    'Indirect Coombs': 'I/Coombs',
    'Blood Test NOS': 'Blood Test NOS',
    'Urine microscopy': 'Urine micro',
    'Full CSF analysis': 'CSF',
    'Indian ink': 'Indian ink',
    'Protein and Sugar': 'Protein and Sugar',
    'White cell count': 'White cell count',
    'Full aspirate analysis': 'Full aspirate analysis',
    'AAFB (1st)': 'AAFB (1st)',
    'AAFB (2nd)': 'AAFB (2nd)',
    'AAFB (3rd)': 'AAFB (3rd)',
    'Full stool analysis': 'Full .A.A',
    'Microscopy': 'Microscopy',
}

module.exports = specimens;