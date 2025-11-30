export interface SegmentationResponse {
    mask: string;
    masked_image: string;
    error?: string;
}

export const apiService = {
    async segmentImage(file: File, apiUrl: string): Promise<SegmentationResponse> {
        const formData = new FormData();
        formData.append("image", file);

        // Clean the URL (remove trailing slash if present) and append /segment
        const baseUrl = apiUrl.replace(/\/$/, "");
        const endpoint = `${baseUrl}/segment`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            console.error("API Service Error:", error);
            throw error;
        }
    },

    async classifyImage(file: File, apiUrl: string): Promise<{ class_id: number }> {
        const formData = new FormData();
        formData.append("image", file);

        const baseUrl = apiUrl.replace(/\/$/, "");
        const endpoint = `${baseUrl}/classify`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            return data;
        } catch (error) {
            console.error("API Service Error (Classification):", error);
            throw error;
        }
    },
};
