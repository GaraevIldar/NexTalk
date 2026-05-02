FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 5002

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["NexTalk.Messaging.Service/NexTalk.Messaging.Service.csproj", "NexTalk.Messaging.Service/"]
RUN dotnet restore "NexTalk.Messaging.Service/NexTalk.Messaging.Service.csproj"
COPY . .
WORKDIR "/src/NexTalk.Messaging.Service"
RUN dotnet build "./NexTalk.Messaging.Service.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./NexTalk.Messaging.Service.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "NexTalk.Messaging.Service.dll"]
