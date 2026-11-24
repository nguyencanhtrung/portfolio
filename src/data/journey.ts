import type { Locale } from '../i18n/ui';

export interface Chapter {
  era: string;
  years: string;
  title: string;
  org: string;
  story: string[];
  metrics: string[];
}

export interface JourneyContent {
  heroName: string;
  heroTagline: string;
  heroIntro: string;
  heroRole: string;
  journeyLabel: string;
  currentLabel: string;
  independentLabel: string;
  chapters: Chapter[];
}

export const journey: Record<Locale, JourneyContent> = {
  en: {
    heroName: 'Canh-Trung Nguyen',
    heroTagline: 'From logic gates to digital twins.',
    heroIntro:
      'A decade building 5G FPGA radios and bringing up O‑RAN hardware on the bench; now leading digital twins and sim-to-real engineering for 5G/6G, connected driving, drones, and physical AI. Building both sides taught me how to keep simulation honest.',
    heroRole: 'Manager · SoC.one, USA',
    journeyLabel: 'The journey',
    currentLabel: 'Programs I lead today',
    independentLabel: 'Independent projects',
    chapters: [
      {
        era: 'CH.01',
        years: '2008 — 2017',
        title: 'Foundations — the gate',
        org: 'HUST, Hanoi, Vietnam → TU Kaiserslautern, Germany',
        story: [
          'Microelectronics at HUST, followed by an M.Sc. in embedded systems at TU Kaiserslautern, graduating at the top of the German grading scale.',
          'Designed an FPGA accelerator for intraday financial risk that ran 68× faster than the legacy software baseline at near one FLOP per cycle.',
          'Cut my teeth profiling critical paths first and validating every cycle-level gain against bit-exact software references.',
        ],
        metrics: ['68× speedup @ 100 MHz', '1.087 cycles / FLOP'],
      },
      {
        era: 'CH.02',
        years: '2017 — 2021',
        title: '5G PHY & Radio — the block',
        org: 'Viettel High Tech → VinSmart, Hanoi, Vietnam',
        story: [
          'Built 5G NR physical-layer IP from scratch on Xilinx FPGAs.',
          'Led a five-engineer team delivering PUSCH, PUCCH Format 3, and a 2T2R digital front-end compliant with the 3GPP spectrum mask.',
          'Closed timing on PDSCH bit-processing at 300 MHz (< 150 µs end-to-end) and shipped an 8T8R macrocell across two RRU hardware generations.',
          'Translated dense 3GPP RAN1/RAN4 specs directly into cycle-accurate RTL.',
        ],
        metrics: [
          'PUSCH @ 250 MHz',
          'PDSCH @ 300 MHz · < 150 µs',
          '8T8R macrocell · 800 Mbps',
          'ACLR 50 dB (3GPP-compliant DFE)',
        ],
      },
      {
        era: 'CH.03',
        years: '2021 — 2022',
        title: 'Acceleration & Vision — the ladder',
        org: 'Techvico (Taiwan - USA) → Avnet (Singapore)',
        story: [
          'Moved up the abstraction stack from hand-written VHDL to Vitis HLS.',
          'Built three custom ISP accelerators—disparity, defect-pixel correction, and geometric transform—alongside a zero-copy streaming pipeline into the Xilinx DPU.',
          'Worked across Southeast Asia as an AMD-Xilinx FAE, debugging unfamiliar customer boards and toolchains on tight timelines.',
          'Got fast at sizing resource budgets on new silicon and translating RTL trade-offs for software teams and executives.',
        ],
        metrics: [
          '3 ISP accelerators in HLS',
          'AMD-Xilinx across SEA',
          'Customer-facing, multi-vendor',
        ],
      },
      {
        era: 'CH.04',
        years: '2021 — 2024',
        title: 'O-RAN Systems — the box',
        org: 'SoC.one, USA - Hanoi Office',
        story: [
          'Joined SoC.one in 2021 to work on full-box O-RAN systems rather than isolated PHY blocks.',
          'Owned 5G L1 FPGA acceleration and hardware bring-up for both O-DU and O-RU platforms.',
          'Debugged fronthaul splits, cross-clock domains, and PTP synchronization—the exact interfaces where disaggregated radios break in the lab.',
          'Spent years on the bench seeing how real RF and timing impairments behave, which later grounded our simulation models.',
        ],
        metrics: [
          '5G L1 FPGA acceleration',
          'O-DU / O-RU hardware',
          'O-RAN fronthaul & timing',
        ],
      },
      {
        era: 'CH.05',
        years: 'Late 2024 — present',
        title: 'Digital Twins & Verticals — the world',
        org: 'SoC.one, USA - Hanoi Office',
        story: [
          'Lead the Verticals Group—30 engineers across physical AI, automotive, drones, and 5G/6G—handling group management while stepping in as tech lead on core architectural calls.',
          'Architect GPU ray-traced radio channel models embedded directly inside multi-agent network and vehicle digital twins.',
          'Own ISAC sensing models and a C-V2X sidelink protocol stack verified clause-by-clause against 3GPP, ETSI, and SAE standards.',
          'Drive sim-to-real validation and hardware/software co-design for autonomous robotics platforms.',
        ],
        metrics: [
          'Verticals Group — 4 programs',
          'physical AI · automotive · drones · 5G/6G',
          '30 engineers',
        ],
      },
    ],
  },
  vi: {
    heroName: 'Nguyễn Cảnh Trung',
    heroTagline: 'Từ cổng logic đến digital twin.',
    heroIntro:
      'Mười năm xây dựng hệ thống vô tuyến 5G trên FPGA và trực tiếp bring-up phần cứng O‑RAN tại phòng lab; hiện dẫn dắt mảng digital twin và kỹ thuật sim-to-real cho 5G/6G, xe kết nối, drone và physical AI. Trực tiếp làm cả hai phía dạy tôi cách giữ cho mô phỏng luôn trung thực với thực tế.',
    heroRole: 'Manager · SoC.one, USA',
    journeyLabel: 'Hành trình',
    currentLabel: 'Những chương trình tôi đang dẫn dắt',
    independentLabel: 'Dự án cá nhân',
    chapters: [
      {
        era: 'CH.01',
        years: '2008 — 2017',
        title: 'Nền móng — cổng logic',
        org: 'ĐH Bách khoa Hà Nội → TU Kaiserslautern, Đức',
        story: [
          'Theo học chuyên ngành Vi điện tử tại ĐH Bách khoa Hà Nội, sau đó lấy bằng Thạc sĩ Hệ thống nhúng tại TU Kaiserslautern (Đức) với xếp loại cao nhất theo thang điểm Đức.',
          'Thiết kế bộ tăng tốc trên FPGA cho bài toán tính rủi ro tài chính trong ngày, đạt tốc độ nhanh gấp 68 lần so với phần mềm nền cũ và chạm ngưỡng gần 1 FLOP mỗi chu kỳ xung nhịp.',
          'Từ đây, tôi rèn được thói quen phân tích các đường găng trước tiên và luôn kiểm chứng từng cải tiến ở mức chu kỳ với mô hình phần mềm chuẩn xác đến từng bit.',
        ],
        metrics: ['Tăng tốc 68× @ 100 MHz', '1.087 chu kỳ / FLOP'],
      },
      {
        era: 'CH.02',
        years: '2017 — 2021',
        title: '5G PHY & Vô tuyến — khối xử lý',
        org: 'Viettel High Tech → VinSmart, Hà Nội',
        story: [
          'Xây dựng các khối IP lớp vật lý 5G NR từ con số không trên FPGA Xilinx.',
          'Dẫn dắt nhóm 5 kỹ sư hoàn thiện các kênh PUSCH, PUCCH Format 3 cùng khối digital front-end 2T2R đạt chuẩn mặt nạ phổ 3GPP.',
          'Đạt chuẩn timing ở 300 MHz cho khối xử lý bit PDSCH (độ trễ toàn tuyến dưới 150 µs), đồng thời hoàn thiện và bàn giao trạm macrocell 8T8R qua hai thế hệ phần cứng RRU.',
          'Chuyển hóa trực tiếp các tài liệu đặc tả 3GPP RAN1/RAN4 dày đặc thành mã RTL chuẩn xác đến từng chu kỳ xung nhịp.',
        ],
        metrics: [
          'PUSCH @ 250 MHz',
          'PDSCH @ 300 MHz · < 150 µs',
          'Macrocell 8T8R · 800 Mbps',
          'ACLR 50 dB (DFE đạt chuẩn 3GPP)',
        ],
      },
      {
        era: 'CH.03',
        years: '2021 — 2022',
        title: 'Tăng tốc & Thị giác — nấc thang',
        org: 'Techvico (Đài Loan – Mỹ) → Avnet (Singapore)',
        story: [
          'Dịch chuyển lên tầng trừu tượng cao hơn, từ viết VHDL thủ công sang phát triển trên Vitis HLS.',
          'Xây dựng ba khối tăng tốc xử lý ảnh ISP chuyên biệt — ước lượng độ sâu, hiệu chỉnh điểm ảnh lỗi và biến đổi hình học — kết nối qua luồng truyền dữ liệu zero-copy thẳng vào Xilinx DPU.',
          'Đảm nhận vai trò FAE cho AMD-Xilinx khắp Đông Nam Á, trực tiếp gỡ lỗi những bo mạch và bộ công cụ hoàn toàn mới từ khách hàng dưới áp lực tiến độ gấp rút.',
          'Rèn khả năng ước lượng nhanh quỹ tài nguyên trên các dòng chip mới, đồng thời diễn giải rõ ràng những đánh đổi ở tầng RTL cho đội ngũ phần mềm và cấp lãnh đạo.',
        ],
        metrics: [
          '3 khối tăng tốc ISP bằng HLS',
          'AMD-Xilinx khắp Đông Nam Á',
          'Làm việc trực tiếp với khách hàng, đa hãng',
        ],
      },
      {
        era: 'CH.04',
        years: '2021 — 2024',
        title: 'Hệ thống O-RAN — thiết bị hoàn chỉnh',
        org: 'SoC.one (Mỹ) — Văn phòng Hà Nội',
        story: [
          'Gia nhập SoC.one năm 2021 để làm hệ thống O-RAN hoàn chỉnh thay vì chỉ dừng ở từng khối PHY đơn lẻ.',
          'Trực tiếp phụ trách mảng tăng tốc 5G L1 trên FPGA và bring-up phần cứng cho cả hai nền tảng O-DU và O-RU.',
          'Gỡ lỗi chia tách fronthaul, giao tiếp liên miền xung nhịp và đồng bộ PTP — đúng những giao diện dễ phát sinh sự cố nhất khi đưa trạm vô tuyến phân tách lên bàn thí nghiệm.',
          'Nhiều năm bám trụ tại phòng lab giúp tôi tận mắt chứng kiến cách các suy hao RF và sai lệch định thời vận hành ngoài thực tế — nền tảng để về sau neo chặt các mô hình mô phỏng với đời thực.',
        ],
        metrics: [
          'Tăng tốc 5G L1 trên FPGA',
          'Phần cứng O-DU / O-RU',
          'Fronthaul & đồng bộ O-RAN',
        ],
      },
      {
        era: 'CH.05',
        years: 'Cuối 2024 — nay',
        title: 'Digital Twin & Verticals — cả thế giới',
        org: 'SoC.one (Mỹ) — Văn phòng Hà Nội',
        story: [
          'Dẫn dắt Verticals Group với 30 kỹ sư trên các mảng physical AI, công nghệ ô tô, drone và 5G/6G — vừa đảm nhận quản lý chung, vừa trực tiếp vào vai tech lead cho những quyết định kiến trúc cốt lõi.',
          'Thiết kế kiến trúc các mô hình kênh vô tuyến ray-traced trên GPU, nhúng trực tiếp vào hệ thống digital twin đa tác tử cho cả mạng lưới lẫn phương tiện.',
          'Phụ trách các mô hình cảm biến ISAC và bộ giao thức C-V2X sidelink được kiểm chứng sát sao đến từng điều khoản của các bộ chuẩn 3GPP, ETSI và SAE.',
          'Thúc đẩy quá trình kiểm chứng sim-to-real và đồng thiết kế phần cứng – phần mềm cho các nền tảng robot tự hành.',
        ],
        metrics: [
          'Verticals Group — 4 chương trình',
          'physical AI · ô tô · drone · 5G/6G',
          '30 kỹ sư',
        ],
      },
    ],
  },
};
