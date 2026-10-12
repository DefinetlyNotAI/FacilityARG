import {NextRequest} from 'next/server';
import {createSecureResponse} from '@/lib/server/utils';
import {genericErrors} from "@/lib/server/data/api";
import {timelineData, years} from "@/lib/server/data/chapters";

/**
 * GET /api/puzzle
 *
 * Returns metadata about the puzzle, specifically the list of years and
 * the total number of puzzle entries for each year.
 *
 * Response format:
 * {
 *   years: number[],                  // Array of all years available in the timeline
 *   yearTotals: Record<number, number> // Mapping of year -> total number of entries
 * }
 *
 * Status codes:
 * - 200: Successfully retrieved puzzle metadata
 * - 500: Failed to fetch metadata due to server error
 */
export async function GET() {
    try {
        const yearTotals: Record<number, number> = {};
        years.forEach(year => {
            yearTotals[year] = timelineData[year].length;
        });

        return createSecureResponse({
            years,
            yearTotals,
        });
    } catch (error) {
        return createSecureResponse({error: genericErrors.failedToFetch}, 500);
    }
}

/**
 * POST /api/puzzle
 *
 * Validates a user's submitted numbers for a specific year and returns
 * the number of correct entries along with the list of correct numbers.
 *
 * Expected request body:
 * {
 *   year: number,       // The year for which numbers are being submitted
 *   numbers: number[]   // Array of numbers submitted by the user
 * }
 *
 * Response format:
 * {
 *   year: number,            // The year that was submitted
 *   correctCount: number,    // Number of numbers correctly matched
 *   correctNumbers: number[],// Array of numbers that are correct
 *   totalForYear: number     // Total number of correct numbers for the year
 * }
 *
 * Status codes:
 * - 200: Successfully validated the numbers
 * - 400: Bad request (missing data, invalid year, or incorrect format)
 * - 500: Server error while processing the request
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {year, numbers} = body;

        if (!year || !numbers || !Array.isArray(numbers)) {
            return createSecureResponse({error: genericErrors.missingData}, 400);
        }

        if (!timelineData[year]) {
            return createSecureResponse({error: 'Invalid year'}, 400);
        }

        const expected = timelineData[year];
        const validNumbers = numbers.filter((num: number) =>
            expected.includes(num)
        );

        return createSecureResponse({
            year,
            correctCount: validNumbers.length,
            correctNumbers: validNumbers,
            totalForYear: expected.length,
        });
    } catch (error) {
        return createSecureResponse({error: genericErrors.failedToFetch}, 500);
    }
}
