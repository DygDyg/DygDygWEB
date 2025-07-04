class StarrySky {
    constructor(canvasId, config = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error('Canvas not found');
        this.ctx = this.canvas.getContext('2d');

        // Настройки по умолчанию
        this.config = {
            rotationSpeed: config.rotationSpeed || 0.0002, // Скорость вращения звёзд
            maxOrbitRadius: config.maxOrbitRadius || Math.max(this.canvas.width, this.canvas.height), // Максимальный радиус орбиты
            starDensity: config.starDensity || 0.01, // Плотность звёзд
            fadeSpeed: config.fadeSpeed || 0.02, // Скорость появления/исчезновения звёзд
            visibleAngleStart: config.visibleAngleStart || Math.PI / 6, // Начальный угол видимости (30°)
            visibleAngleEnd: config.visibleAngleEnd || 3 * Math.PI / 2, // Конечный угол видимости (270°)
            flickerSpeed: config.flickerSpeed || 0.02, // Скорость мерцания
            flickerIntensity: config.flickerIntensity || 0.3, // Интенсивность мерцания
            gradientColors: config.gradientColors || ['#1a1a1a', '#2a2a4a'], // Градиент для ночного неба
            cloudConfig: {
                cloudCount: config.cloudConfig?.cloudCount || 5, // Количество облаков
                cloudSpeed: config.cloudConfig?.cloudSpeed || 0.5, // Скорость движения облаков (пиксели за кадр)
                cloudOpacity: config.cloudConfig?.cloudOpacity || 0.1, // Прозрачность облаков
                cloudBlur: config.cloudConfig?.cloudBlur || 20 // Уровень размытия облаков (пиксели)
            }
        };

        // Настройка размеров canvas
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Центр вращения внизу экрана
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height;

        // Массив для хранения звёзд
        this.stars = [];
        this.numStars = Math.floor(this.canvas.width * this.canvas.height * this.config.starDensity);

        // Массив для хранения облаков
        this.clouds = [];

        // Создание звёзд
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push(this.createStar());
        }

        // Создание облаков
        for (let i = 0; i < this.config.cloudConfig.cloudCount; i++) {
            this.clouds.push(this.createCloud());
        }

        // Обработка изменения размера окна
        window.addEventListener('resize', () => this.handleResize());

        // Запуск анимации
        this.animate();
    }

    createStar() {
        return {
            angle: Math.random() * Math.PI, // Ограничиваем угол для верхней полусферы
            orbitRadius: Math.random() * this.config.maxOrbitRadius,
            x: 0, // Будет обновлено в updateStar
            y: 0,
            radius: Math.random() * 1.5,
            baseAlpha: Math.random() * 0.5 + 0.5, // Базовая прозрачность
            alpha: 0, // Начальная прозрачность
            velocity: this.config.flickerSpeed * (Math.random() * 0.5 + 0.5), // Скорость мерцания
            direction: Math.random() < 0.5 ? 1 : -1 // Направление изменения прозрачности
        };
    }

    createCloud() {
        return {
            x: Math.random() * this.canvas.width, // Начальная позиция по X
            y: Math.random() * this.canvas.height * 0.5, // Ограничение по Y (верхняя половина экрана)
            radius: Math.random() * 100 + 50 // Радиус облака (50–150 пикселей)
        };
    }

    updateStar(star) {
        // Вращение звезды вокруг центра
        star.angle += this.config.rotationSpeed;
        star.x = this.centerX + Math.cos(star.angle) * star.orbitRadius;
        star.y = this.centerY - Math.sin(star.angle) * star.orbitRadius;

        // Ограничение угла для имитации горизонта
        if (star.angle > Math.PI) {
            star.angle -= Math.PI;
            star.x = this.centerX + Math.cos(star.angle) * star.orbitRadius;
            star.y = this.centerY - Math.sin(star.angle) * star.orbitRadius;
            star.alpha = 0; // Сбрасываем прозрачность при возвращении
        }

        // Плавное появление и исчезновение
        if (star.angle < this.config.visibleAngleStart || star.angle > this.config.visibleAngleEnd) {
            star.alpha = Math.max(0, star.alpha - this.config.fadeSpeed);
        } else {
            star.alpha = Math.min(star.baseAlpha, star.alpha + this.config.fadeSpeed);
        }

        // Мерцание звезды
        if (star.alpha > 0) {
            star.baseAlpha += this.config.flickerSpeed * star.direction;
            const minAlpha = Math.max(0.5 - this.config.flickerIntensity, 0);
            const maxAlpha = Math.min(0.5 + this.config.flickerIntensity, 1);
            if (star.baseAlpha > maxAlpha || star.baseAlpha < minAlpha) {
                star.direction *= -1;
            }
        }

        // Отрисовка звезды
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        this.ctx.fill();
    }

    updateCloud(cloud) {
        // Движение облака слева направо
        cloud.x += this.config.cloudConfig.cloudSpeed;
        if (cloud.x - cloud.radius > this.canvas.width) {
            cloud.x = -cloud.radius; // Перемещение за левый край
            cloud.y = Math.random() * this.canvas.height * 0.5; // Новая случайная высота
            cloud.radius = Math.random() * 100 + 50; // Новый случайный радиус
        }

        // Отрисовка облака с радиальным градиентом
        const gradient = this.ctx.createRadialGradient(
            cloud.x, cloud.y, 0,
            cloud.x, cloud.y, cloud.radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.config.cloudConfig.cloudOpacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawBackground() {
        // Создание радиального градиента для фона
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, Math.max(this.canvas.width, this.canvas.height)
        );
        gradient.addColorStop(0, this.config.gradientColors[0]); // Цвет у горизонта
        gradient.addColorStop(1, this.config.gradientColors[1]); // Цвет в верхней части
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height;
        this.numStars = Math.floor(this.canvas.width * this.canvas.height * this.config.starDensity);
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push(this.createStar());
        }
        this.clouds = [];
        for (let i = 0; i < this.config.cloudConfig.cloudCount; i++) {
            this.clouds.push(this.createCloud());
        }
    }

    animate() {
        // Отрисовка фона
        this.drawBackground();

        // Отрисовка облаков с размытием
        this.ctx.filter = `blur(${this.config.cloudConfig.cloudBlur}px)`;
        this.clouds.forEach(cloud => this.updateCloud(cloud));

        // Сброс фильтра для звёзд (чтобы они оставались чёткими)
        this.ctx.filter = 'none';
        this.stars.forEach(star => this.updateStar(star));

        requestAnimationFrame(() => this.animate());
    }
}

// Экспорт для использования в браузере
window.StarrySky = StarrySky;