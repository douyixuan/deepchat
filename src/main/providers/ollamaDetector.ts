import { BrowserWindow } from 'electron'
import axios from 'axios'
import { logger } from '../utils/logger'
import { CONFIG_EVENTS } from '../../renderer/src/events'

// Default Ollama URL
const DEFAULT_OLLAMA_URL = 'http://localhost:11434'

/**
 * Class responsible for detecting Ollama service
 */
export class OllamaDetector {
    private mainWindow: BrowserWindow | null = null
    private isDetecting: boolean = false
    private detectionInterval: NodeJS.Timeout | null = null
    private detectionEnabled: boolean = true

    constructor() { }

    /**
     * Set the main window reference
     */
    setMainWindow(window: BrowserWindow) {
        this.mainWindow = window
    }

    /**
     * Start periodic Ollama detection
     */
    startDetection(intervalMs: number = 30000) {
        if (this.isDetecting) return

        this.isDetecting = true
        this.detectionEnabled = true

        // Run detection immediately
        this.detectOllama()

        // Then set up interval
        this.detectionInterval = setInterval(() => {
            if (this.detectionEnabled) {
                this.detectOllama()
            }
        }, intervalMs)

        logger.info('Ollama detection service started')
    }

    /**
     * Stop Ollama detection
     */
    stopDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval)
            this.detectionInterval = null
        }
        this.isDetecting = false
        this.detectionEnabled = false
        logger.info('Ollama detection service stopped')
    }

    /**
     * Detect if Ollama service is running
     */
    async detectOllama() {
        if (!this.mainWindow || !this.detectionEnabled) return

        try {
            const response = await axios.get(`${DEFAULT_OLLAMA_URL}/api/tags`, {
                timeout: 2000 // Short timeout to avoid long waits
            })

            if (response.status === 200) {
                logger.info('Ollama service detected')

                // Send event to renderer process
                if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                    logger.info('Sending Ollama detected event to renderer')
                    this.mainWindow.webContents.send(CONFIG_EVENTS.PROVIDER_OLLAMA_DETECTED)

                    // Stop detection after successful detection to avoid repeated notifications
                    this.detectionEnabled = false
                }
            }
        } catch (error) {
            // Silently fail as Ollama might not be installed
            logger.debug('Ollama service not detected or error occurred', error)
        }
    }

    /**
     * Re-enable detection (useful after user dismisses notification)
     */
    enableDetection() {
        this.detectionEnabled = true
    }
}
