export const FLEET_DATA: any = {
  name:'Capital Fleet',
  missionStatement:
    'Our fleet is committed to delivering innovative, efficient, and sustainable services across all operations.',
  accomplishments: [
    {
      id: '1',
      title: 'Fleet Efficiency Optimization',
      description: 'Successfully implemented AI-driven route optimization resulting in significant fuel savings and improved delivery times.',
      squad: 'Innovation Squad',
      date: new Date('2024-02-15'),
      impact: 'Reduced fuel consumption by 25% and improved delivery efficiency by 30%',
      benefits: [
        'Decreased carbon emissions',
        'Improved customer satisfaction through faster deliveries',
        'Reduced operational costs',
        'Enhanced driver satisfaction with optimized routes'
      ],
      teamMembers: [
        {
          name: 'Sarah Chen',
          role: 'Project Lead',
          contribution: 'Led the implementation and coordination of the AI system'
        },
        {
          name: 'Mike Rodriguez',
          role: 'Data Scientist',
          contribution: 'Developed the machine learning models for route optimization'
        },
        {
          name: 'Lisa Park',
          role: 'Fleet Operations',
          contribution: 'Provided operational insights and testing support'
        }
      ],
      metrics: [
        {
          label: 'Fuel Savings',
          value: '25%'
        },
        {
          label: 'Delivery Time',
          value: '-30%'
        },
        {
          label: 'CO2 Reduction',
          value: '20 tons'
        }
      ]
    },
    {
      id: '2',
      title: 'Safety Protocol Enhancement',
      description: 'Implemented comprehensive safety measures and training programs leading to significant reduction in incidents.',
      squad: 'Safety Squad',
      date: new Date('2024-01-20'),
      impact: 'Achieved 45% reduction in safety incidents and improved compliance scores',
      benefits: [
        'Enhanced workplace safety',
        'Reduced insurance premiums',
        'Improved team morale',
        'Better regulatory compliance'
      ],
      teamMembers: [
        {
          name: 'John Martinez',
          role: 'Safety Director',
          contribution: 'Developed and implemented new safety protocols'
        },
        {
          name: 'Emily Wong',
          role: 'Training Coordinator',
          contribution: 'Created and conducted safety training programs'
        }
      ],
      metrics: [
        {
          label: 'Incident Reduction',
          value: '45%'
        },
        {
          label: 'Compliance Score',
          value: '98%'
        }
      ]
    },
    {
      id: '3',
      title: 'Green Fleet Initiative Success',
      description: 'Successfully transitioned 30% of fleet vehicles to electric alternatives.',
      squad: 'Sustainability Squad',
      date: new Date('2024-03-01'),
      impact: 'Significant reduction in carbon footprint and operational costs',
      benefits: [
        'Reduced environmental impact',
        'Lower maintenance costs',
        'Enhanced brand reputation',
        'Government incentives qualification'
      ],
      teamMembers: [
        {
          name: 'Alex Green',
          role: 'Sustainability Lead',
          contribution: 'Led the electric vehicle transition program'
        },
        {
          name: 'Maria Santos',
          role: 'Fleet Analyst',
          contribution: 'Conducted cost-benefit analysis and vehicle selection'
        }
      ],
      metrics: [
        {
          label: 'EV Transition',
          value: '30%'
        },
        {
          label: 'Cost Reduction',
          value: '20%'
        }
      ]
    }
  ],
  objectives: [
    {
      name: 'Optimize Fleet Efficiency',
      description: 'Reduce fuel consumption by 20% over the next two years.',
      color: '#ffdfba',
      link: 'objective-link-1',
    },
    {
      name: 'Enhance Safety Standards',
      description: 'Achieve a 30% reduction in fleet-related accidents.',
      color: '#ffb3ba',
      link: 'objective-link-2',
    },
    {
      name: 'Increase Fleet Automation',
      description: 'Automate 50% of fleet operations by next year.',
      color: '#bae1ff',
      link: 'objective-link-3',
    },
    {
      name: 'Improve Driver Training',
      description: 'Provide advanced training programs for all drivers.',
      color: '#baffc9',
      link: 'objective-link-4',
    },
    {
      name: 'Enhance Customer Satisfaction',
      description: 'Improve customer feedback scores by 25%.',
      color: '#ffdfba',
      link: 'objective-link-5',
    },
    {
      name: 'Integrate AI Solutions',
      description: 'Implement AI-driven optimization tools.',
      color: '#ffb3ba',
      link: 'objective-link-6',
    },
    {
      name: 'Expand Fleet Size',
      description: 'Grow the fleet by 10% in the next quarter.',
      color: '#bae1ff',
      link: 'objective-link-7',
    },
    {
      name: 'Promote Environmental Sustainability',
      description:
        'Implement eco-friendly policies to reduce carbon emissions.',
      color: '#baffc9',
      link: 'objective-link-8',
    },
    {
      name: 'Streamline Maintenance Processes',
      description:
        'Reduce fleet downtime by 15% through efficient maintenance.',
      color: '#ffdfba',
      link: 'objective-link-9',
    },
  ],
  leadership: [    
    {
      "name": "Mike Johnson",
      "title": "COO",
      "image": "mike-johnson.jpg",
      "email": "mike.johnson@example.com",
      "department": "Operations",
      "phone": "+1 (555) 333-4444"
    },
    {
      "name": "Sarah Lee",
      "title": "CFO",
      "image": "sarah-lee.jpg",
      "email": "sarah.lee@example.com",
      "department": "Finance",
      "phone": "+1 (555) 444-5555"
    }
  
    
  ],
  tools: [
    {
      name: 'Fleet Monitoring Dashboard',
      description: 'Real-time monitoring of fleet performance.',
      color: '#bae1ff',
      link: 'tool-link-1',
    },
    {
      name: 'Maintenance Tracker',
      description: 'Track vehicle maintenance schedules and updates.',
      color: '#baffc9',
      link: 'tool-link-2',
    },
    {
      name: 'Route Optimization Tool',
      description: 'Optimize routes for efficiency and fuel savings.',
      color: '#ffdfba',
      link: 'tool-link-3',
    },
    {
      name: 'Fuel Efficiency Analyzer',
      description: 'Analyze fuel consumption patterns.',
      color: '#ffb3ba',
      link: 'tool-link-4',
    },
    {
      name: 'Driver Performance Tracker',
      description: 'Evaluate driver performance metrics.',
      color: '#bae1ff',
      link: 'tool-link-5',
    },
    {
      name: 'Fleet Safety Manager',
      description: 'Ensure compliance with fleet safety regulations.',
      color: '#baffc9',
      link: 'tool-link-6',
    },
    {
      name: 'AI Maintenance Predictor',
      description: 'Predict maintenance needs using AI.',
      color: '#ffdfba',
      link: 'tool-link-7',
    },
    {
      name: 'Real-Time GPS Tracker',
      description: 'Track fleet vehicles in real-time.',
      color: '#ffb3ba',
      link: 'tool-link-8',
    },
    {
      name: 'Fleet Reporting System',
      description: 'Generate reports on fleet performance and expenses.',
      color: '#bae1ff',
      link: 'tool-link-9',
    },
  ],
  programs: [
    {
      name: 'Sustainability Program',
      description: "Reducing the fleet's carbon footprint by 30%.",
      color: '#ffb3ba',
      link: 'program-link-1',
    },
    {
      name: 'Safety First Initiative',
      description: 'Promoting safety across all fleet operations.',
      color: '#ffdfba',
      link: 'program-link-2',
    },
    {
      name: 'Efficiency Boost Program',
      description: 'Implementing strategies to optimize fleet efficiency.',
      color: '#baffc9',
      link: 'program-link-3',
    },
    {
      name: 'Automation Drive',
      description: 'Increasing automation within fleet operations.',
      color: '#bae1ff',
      link: 'program-link-4',
    },
    {
      name: 'Green Fleet Program',
      description: 'Introducing eco-friendly fleet practices.',
      color: '#ffb3ba',
      link: 'program-link-5',
    },
    {
      name: 'Driver Excellence Program',
      description: 'Training and rewarding top-performing drivers.',
      color: '#ffdfba',
      link: 'program-link-6',
    },
    {
      name: 'Digital Transformation',
      description: 'Implementing new digital tools for fleet management.',
      color: '#baffc9',
      link: 'program-link-7',
    },
    {
      name: 'Data-Driven Decisions',
      description: 'Leveraging data analytics to drive fleet decisions.',
      color: '#bae1ff',
      link: 'program-link-8',
    },
    {
      name: 'AI Fleet Initiative',
      description: 'Harnessing AI to improve fleet operations.',
      color: '#ffb3ba',
      link: 'program-link-9',
    },
  ],
  squads: [
    {
      name: 'Engineering Squad',
      description: 'Responsible for fleet technical solutions.',
      color: '#ffb3ba',
      link: 'squad-link-1',
    },
    {
      name: 'Operations Squad',
      description: 'Oversees daily fleet operations.',
      color: '#ffdfba',
      link: 'squad-link-2',
    },
    {
      name: 'Logistics Squad',
      description: 'Coordinates logistics and transportation.',
      color: '#baffc9',
      link: 'squad-link-3',
    },
    {
      name: 'Maintenance Squad',
      description: 'Ensures vehicles are properly maintained.',
      color: '#bae1ff',
      link: 'squad-link-4',
    },
    {
      name: 'Safety Squad',
      description: 'Ensures all safety protocols are followed.',
      color: '#ffb3ba',
      link: 'squad-link-5',
    },
    {
      name: 'Automation Squad',
      description: 'Develops automation strategies for the fleet.',
      color: '#ffdfba',
      link: 'squad-link-6',
    },
    {
      name: 'Fuel Efficiency Squad',
      description: 'Focuses on improving fleet fuel efficiency.',
      color: '#baffc9',
      link: 'squad-link-7',
    },
    {
      name: 'Driver Support Squad',
      description: 'Supports drivers with training and tools.',
      color: '#bae1ff',
      link: 'squad-link-8',
    },
    {
      name: 'Innovation Squad',
      description: 'Drives innovation across fleet operations.',
      color: '#ffb3ba',
      link: 'squad-link-9',
    },
  ],
  resources: [
    {
      name: 'Fleet Guidelines',
      link: 'resources/fleet-guidelines.pdf',
    },
    {
      name: 'Safety Procedures',
      link: 'resources/safety-procedures.pdf',
    },
    {
      name: 'Maintenance Manual',
      link: 'resources/maintenance-manual.pdf',
    },
    {
      name: 'Driver Handbook',
      link: 'resources/driver-handbook.pdf',
    },
    {
      name: 'Fleet Expansion Plan',
      link: 'resources/fleet-expansion-plan.pdf',
    },
    {
      name: 'AI Implementation Strategy',
      link: 'resources/ai-implementation-strategy.pdf',
    },
    {
      name: 'Sustainability Report',
      link: 'resources/sustainability-report.pdf',
    },
    {
      name: 'Fuel Efficiency Plan',
      link: 'resources/fuel-efficiency-plan.pdf',
    },
    {
      name: 'Automation Strategy',
      link: 'resources/automation-strategy.pdf',
    },
  ],
};
