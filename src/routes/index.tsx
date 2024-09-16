import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { AuthRoutes } from "./auth.routes";
import { AppRoutes } from "./app.routes";

import { gluestackUIConfig } from "../../config/gluestack-ui.config"
import { Box } from "@gluestack-ui/themed";

import { useAuth } from "@hooks/useAuth";

export function Routes() {
    const theme = DefaultTheme
    theme.colors.background = gluestackUIConfig.tokens.colors.gray700

    const { user } = useAuth();

    return (
        <Box flex={1} bg="$gray600">
            <NavigationContainer theme={theme}>
                <AuthRoutes />
            </NavigationContainer>
        </Box>
    )
}