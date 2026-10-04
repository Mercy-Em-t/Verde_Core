// api-service/phases.js

/**
 * Defines the core phases of the System Development Lifecycle (SDLC).
 */

const SDLC_PHASES = {
    PROJECT_INITIATION: {
        id: 'phase_project_initiation',
        title: 'Project Initiation',
        description: 'The starting phase where the project is formally requested and its feasibility is assessed.',
        deliverables: [
            {
                id: 'doc_system_request',
                title: 'System Request',
                description: 'A formal request containing the business reason for building a system and the expected value. Includes sponsor, business need, requirements, value, and special issues.'
            },
            {
                id: 'doc_feasibility_study',
                title: 'Feasibility Study',
                description: 'An assessment of the technical, economic, and organizational feasibility of the project.'
            }
        ]
    },
    PROJECT_IDENTIFICATION: {
        id: 'phase_project_identification',
        title: 'Project Identification',
        description: 'Initial phase where core business needs are identified and processes are evaluated for management, engineering, or automation.',
        subTracks: {
            BPM: {
                id: 'bpm',
                title: 'Business Process Management',
                description: 'Analyzing, optimizing, and managing existing business processes.',
                steps: [
                    {
                        stepId: 'bpm_1',
                        title: 'Define and map steps in a business process',
                        order: 1
                    },
                    {
                        stepId: 'bpm_2',
                        title: 'Create steps to improve on steps in the process that add value',
                        order: 2
                    },
                    {
                        stepId: 'bpm_3',
                        title: 'Find ways to eliminate or consolidate steps',
                        order: 3
                    },
                    {
                        stepId: 'bpm_4',
                        title: 'Create or adjust electronic workflows',
                        order: 4
                    }
                ]
            },
            BPE: {
                id: 'bpe',
                title: 'Business Process Engineering',
                description: 'Fundamental rethinking and radical redesign of business processes.',
                steps: [] // To be defined
            },
            BPA: {
                id: 'bpa',
                title: 'Business Process Automation',
                description: 'Automating complex business processes and functions beyond standard data manipulation.',
                steps: [] // To be defined
            }
        }
    }
    // Additional phases (e.g. Design, Implementation, QA, Deployment) will go here
};

export default SDLC_PHASES;
