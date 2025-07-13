import { writeFileSync, mkdirSync, existsSync } from 'fs';

/**
 * Logging utility for API responses and other data
 * @param {string} apiName - Name of the API or log category
 * @param {any} response - Data to log
 * @param {string} filename - Optional custom filename
 */
export function logResponse(apiName: string, response: any, filename: string | null = null): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logDir = './logs';

    // Create logs directory if it doesn't exist
    if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
    }

    // Generate filename with datetime
    const logFilename = filename || `${apiName}_${timestamp}.json`;
    const logPath = `${logDir}/${logFilename}`;

    // Prepare log data
    const logData = {
        timestamp: new Date().toISOString(),
        api: apiName,
        response: response
    };

    try {
        writeFileSync(logPath, JSON.stringify(logData, null, 2));
        console.log(`📝 Logged ${apiName} response to: ${logPath}`);
    } catch (error) {
        console.error(`❌ Failed to log ${apiName} response:`, error);
    }
}

/**
 * Log errors with stack trace
 * @param {string} context - Where the error occurred
 * @param {Error} error - Error object
 * @param {any} additionalData - Additional data to log
 */
export function logError(context: string, error: Error, additionalData: any = null): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logDir = './logs';

    if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
    }

    const logFilename = `error_${context}_${timestamp}.json`;
    const logPath = `${logDir}/${logFilename}`;

    const logData = {
        timestamp: new Date().toISOString(),
        context: context,
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        additionalData: additionalData
    };

    try {
        writeFileSync(logPath, JSON.stringify(logData, null, 2));
        console.error(`📝 Logged error for ${context} to: ${logPath}`);
    } catch (logError) {
        console.error(`❌ Failed to log error:`, logError);
    }
}

/**
 * Log general information
 * @param {string} category - Log category
 * @param {any} data - Data to log
 * @param {string} filename - Optional custom filename
 */
export function logInfo(category: string, data: any, filename: string | null = null): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logDir = './logs';

    if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
    }

    const logFilename = filename || `info_${category}_${timestamp}.json`;
    const logPath = `${logDir}/${logFilename}`;

    const logData = {
        timestamp: new Date().toISOString(),
        category: category,
        data: data
    };

    try {
        writeFileSync(logPath, JSON.stringify(logData, null, 2));
        console.log(`📝 Logged info for ${category} to: ${logPath}`);
    } catch (error) {
        console.error(`❌ Failed to log info for ${category}:`, error);
    }
} 