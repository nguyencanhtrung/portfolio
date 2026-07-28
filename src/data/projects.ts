import type { Locale } from '../i18n/ui';

export interface ProjectSection {
  heading: string;
  body: string[];
}

export interface Project {
  slug: string;
  name: string;
  period: string;
  role: string;
  oneLiner: string;
  sections: ProjectSection[];
  stack: string[];
}

export const projects: Record<Locale, Project[]> = {
  en: [
    {
      slug: 'connected-driving',
      name: 'Connected Driving — C-V2X Sidelink',
      period: 'Ongoing',
      role: 'Tech Lead',
      oneLiner:
        'Direct vehicle-to-vehicle communication over the 5G PC5 sidelink, built around SAE-defined safety scenarios.',
      sections: [
        {
          heading: 'Why it matters',
          body: [
            'The safety functions that matter most in traffic — a car braking hard two vehicles ahead, someone running a red light at an intersection — cannot afford a round trip through a base station. C-V2X defines the PC5 sidelink for exactly this: vehicles talking to each other directly, peer to peer, with or without network coverage.',
          ],
        },
        {
          heading: 'What we build',
          body: [
            'A PC5 sidelink interface that establishes direct peer-to-peer links between vehicles, and on top of it the core connected-driving scenarios defined by the US SAE standards — the V2V safety message exchange behind use cases like forward collision warning and intersection assist.',
            'The work spans the radio-adjacent protocol layers up to the application messages, with the scenario definitions and message sets anchored in the SAE J2735 / J2945 family.',
          ],
        },
        {
          heading: 'My role',
          body: [
            'Technical leadership: system architecture, interpreting the 3GPP and SAE standards into implementable behavior, guiding the implementation team, and setting the verification strategy so that what we ship is traceable back to the clauses that define it.',
          ],
        },
      ],
      stack: [
        'C-V2X (3GPP sidelink)',
        'PC5 interface',
        'SAE J2735 / J2945 family',
        'V2V day-1 safety scenarios',
        '5G protocol stack',
      ],
    },
    {
      slug: 'v2x-protocol-stack',
      name: 'V2X Protocol Stack',
      period: 'Ongoing',
      role: 'Tech Lead',
      oneLiner:
        'A 5G protocol implementation kept honest by the standards that define it — 3GPP, ETSI, SAE.',
      sections: [
        {
          heading: 'Why it matters',
          body: [
            'V2X sits at the junction of two standards worlds: the cellular stack specified by 3GPP, and the intelligent-transport layers specified by ETSI and SAE. An implementation that drifts from any of them stops interoperating — and in this domain, interoperability is the product.',
          ],
        },
        {
          heading: 'What we build',
          body: [
            'Protocol layers for V2X communication, and the middleware that connects the stack to the applications riding on it.',
            'The engineering discipline is spec-first: every field, timer, and bit width in the implementation traces back to a specific clause of a specific standard, and claims about behavior are verified against the raw specification text rather than against folklore.',
          ],
        },
        {
          heading: 'My role',
          body: [
            'Leading the protocol team: architecture, the standards-verification methodology, and the review discipline that keeps a multi-standard codebase compliant as both the code and the standards evolve.',
          ],
        },
      ],
      stack: ['3GPP NR sidelink', 'ETSI ITS', 'SAE standards', 'ASN.1', 'C/C++'],
    },
    {
      slug: 'digital-twin-channel-sim',
      name: 'Digital Twin & Channel Simulation',
      period: 'Ongoing',
      role: 'Tech Lead',
      oneLiner:
        'Ray-traced radio channels inside vehicular digital twins — testing connectivity before the first drive.',
      sections: [
        {
          heading: 'Why it matters',
          body: [
            'Field-testing V2X is expensive, slow, and occasionally dangerous — you cannot schedule a near-collision. A digital twin with a physically grounded radio channel lets those scenarios run virtually, repeatably, at scale, before a single vehicle moves.',
          ],
        },
        {
          heading: 'What we build',
          body: [
            'GPU-accelerated ray-tracing channel simulation, built on NVIDIA Sionna RT, embedded into vehicular digital-twin environments — so the simulated radio behaves like radio, with geometry, materials, and mobility shaping the link.',
            'The twin connects to virtual ECUs and vehicle buses through open co-simulation standards (SIL Kit), and feeds a research direction in ISAC — integrated sensing and communication, where the same radio both senses the scene and carries the data.',
          ],
        },
        {
          heading: 'My role',
          body: [
            'Tech lead for the simulation architecture and the channel-modeling methodology, and steering the ISAC research agenda.',
          ],
        },
      ],
      stack: ['NVIDIA Sionna RT', 'GPU ray tracing', 'SIL Kit co-simulation', 'ISAC research', 'Python'],
    },
    {
      slug: 'robotics-sim2real',
      name: 'Robotics Sim2Real',
      period: 'Ongoing',
      role: 'Tech Lead',
      oneLiner:
        'Closing the gap between a simulated robot and the real one — measured, not assumed.',
      sections: [
        {
          heading: 'Why it matters',
          body: [
            'Policies trained in simulation fail on real robots whenever the simulator differs from reality in ways that matter. The interesting question is not “is the sim realistic?” but “which specific gap — actuator, vision, contact — is breaking the transfer, and how do we measure it?”',
          ],
        },
        {
          heading: 'What we build',
          body: [
            'A digital twin of an open-source mobile manipulator from the LeRobot ecosystem (LeKiwi), and a sim-to-real methodology around it: actuator response matching, open-loop replay as the foundational diagnostic — the same command sequence played on sim and real, states overlaid — and explicit fidelity tiers so that “realistic enough” is a defined bar, not a feeling.',
            'On top of the twin, imitation-learning policies are trained in simulation and evaluated on the physical robot, with transfer measured as a first-class metric rather than eyeballed.',
          ],
        },
        {
          heading: 'My role',
          body: [
            'Tech lead: designing the methodology and evaluation gates, and guiding the team building both the twin and the learning pipeline.',
          ],
        },
      ],
      stack: [
        'LeKiwi / LeRobot (Hugging Face)',
        'Physics simulation',
        'Imitation learning',
        'Sim2real diagnostics',
        'Python',
      ],
    },
  ],
  vi: [
    {
      slug: 'connected-driving',
      name: 'Connected Driving — C-V2X Sidelink',
      period: 'Đang triển khai',
      role: 'Tech Lead',
      oneLiner:
        'Giao tiếp trực tiếp xe-với-xe qua sidelink PC5 của 5G, xây quanh các kịch bản an toàn theo chuẩn SAE.',
      sections: [
        {
          heading: 'Vì sao quan trọng',
          body: [
            'Những chức năng an toàn quan trọng nhất trong giao thông — chiếc xe phanh gấp cách hai xe phía trước, ai đó vượt đèn đỏ ở ngã tư — không thể chờ một vòng đi-về qua trạm gốc. C-V2X định nghĩa sidelink PC5 cho chính xác việc này: các xe nói chuyện trực tiếp với nhau, peer-to-peer, có hay không có vùng phủ mạng.',
          ],
        },
        {
          heading: 'Chúng tôi xây gì',
          body: [
            'Một giao diện sidelink PC5 thiết lập kết nối trực tiếp giữa các xe, và trên đó là các kịch bản connected-driving cốt lõi theo chuẩn SAE của Mỹ — trao đổi bản tin an toàn V2V đứng sau các use case như cảnh báo va chạm phía trước hay hỗ trợ qua giao lộ.',
            'Phạm vi công việc trải từ các lớp giao thức sát radio lên tới bản tin ứng dụng, với định nghĩa kịch bản và tập bản tin bám theo họ chuẩn SAE J2735 / J2945.',
          ],
        },
        {
          heading: 'Vai trò của tôi',
          body: [
            'Dẫn dắt kỹ thuật: kiến trúc hệ thống, diễn dịch chuẩn 3GPP và SAE thành hành vi triển khai được, dẫn dắt đội thực thi, và đặt chiến lược kiểm chứng để mọi thứ giao đi đều truy vết được về đúng điều khoản định nghĩa nó.',
          ],
        },
      ],
      stack: [
        'C-V2X (3GPP sidelink)',
        'Giao diện PC5',
        'Họ chuẩn SAE J2735 / J2945',
        'Kịch bản an toàn V2V day-1',
        '5G protocol stack',
      ],
    },
    {
      slug: 'v2x-protocol-stack',
      name: 'V2X Protocol Stack',
      period: 'Đang triển khai',
      role: 'Tech Lead',
      oneLiner:
        'Một triển khai giao thức 5G được giữ trung thực bởi chính các chuẩn định nghĩa nó — 3GPP, ETSI, SAE.',
      sections: [
        {
          heading: 'Vì sao quan trọng',
          body: [
            'V2X nằm ở giao điểm của hai thế giới chuẩn: stack di động do 3GPP đặc tả, và các lớp giao thông thông minh do ETSI và SAE đặc tả. Một triển khai trôi khỏi bất kỳ chuẩn nào sẽ ngừng tương tác được — và trong lĩnh vực này, khả năng tương tác chính là sản phẩm.',
          ],
        },
        {
          heading: 'Chúng tôi xây gì',
          body: [
            'Các lớp giao thức cho giao tiếp V2X, và middleware nối stack với các ứng dụng chạy trên nó.',
            'Kỷ luật kỹ thuật là spec-first: mọi trường, timer, độ rộng bit trong triển khai đều truy vết về một điều khoản cụ thể của một chuẩn cụ thể, và mọi khẳng định về hành vi được kiểm chứng trên văn bản đặc tả gốc thay vì theo truyền miệng.',
          ],
        },
        {
          heading: 'Vai trò của tôi',
          body: [
            'Dẫn dắt đội protocol: kiến trúc, phương pháp kiểm chứng theo chuẩn, và kỷ luật review giữ cho một codebase đa chuẩn luôn tuân thủ khi cả code lẫn chuẩn đều tiến hoá.',
          ],
        },
      ],
      stack: ['3GPP NR sidelink', 'ETSI ITS', 'Chuẩn SAE', 'ASN.1', 'C/C++'],
    },
    {
      slug: 'digital-twin-channel-sim',
      name: 'Digital Twin & Channel Simulation',
      period: 'Đang triển khai',
      role: 'Tech Lead',
      oneLiner:
        'Kênh vô tuyến ray-tracing bên trong digital twin của xe — kiểm thử kết nối trước khi xe lăn bánh.',
      sections: [
        {
          heading: 'Vì sao quan trọng',
          body: [
            'Thử nghiệm V2X ngoài hiện trường thì đắt, chậm, và đôi khi nguy hiểm — không ai “lên lịch” được một pha suýt va chạm. Một digital twin với kênh vô tuyến có nền tảng vật lý cho phép các kịch bản đó chạy ảo, lặp lại được, ở quy mô lớn, trước khi một chiếc xe nào phải di chuyển.',
          ],
        },
        {
          heading: 'Chúng tôi xây gì',
          body: [
            'Mô phỏng kênh bằng ray-tracing tăng tốc GPU, xây trên NVIDIA Sionna RT, nhúng vào môi trường digital twin của phương tiện — để radio mô phỏng hành xử như radio thật, với hình học, vật liệu và chuyển động định hình đường truyền.',
            'Twin kết nối với các ECU ảo và bus của xe qua chuẩn co-simulation mở (SIL Kit), và nuôi một hướng nghiên cứu về ISAC — integrated sensing and communication, nơi cùng một sóng radio vừa cảm nhận khung cảnh vừa mang dữ liệu.',
          ],
        },
        {
          heading: 'Vai trò của tôi',
          body: [
            'Tech lead cho kiến trúc mô phỏng và phương pháp mô hình hoá kênh, đồng thời định hướng chương trình nghiên cứu ISAC.',
          ],
        },
      ],
      stack: ['NVIDIA Sionna RT', 'GPU ray tracing', 'SIL Kit co-simulation', 'Nghiên cứu ISAC', 'Python'],
    },
    {
      slug: 'robotics-sim2real',
      name: 'Robotics Sim2Real',
      period: 'Đang triển khai',
      role: 'Tech Lead',
      oneLiner:
        'Thu hẹp khoảng cách giữa robot mô phỏng và robot thật — bằng đo đạc, không bằng cảm giác.',
      sections: [
        {
          heading: 'Vì sao quan trọng',
          body: [
            'Policy huấn luyện trong mô phỏng sẽ thất bại trên robot thật mỗi khi simulator khác thực tế ở những điểm trọng yếu. Câu hỏi thú vị không phải là “sim đã đủ giống thật chưa?” mà là “khoảng cách cụ thể nào — actuator, thị giác, tiếp xúc — đang phá vỡ quá trình chuyển giao, và đo nó bằng cách nào?”',
          ],
        },
        {
          heading: 'Chúng tôi xây gì',
          body: [
            'Một digital twin của mobile manipulator mã nguồn mở thuộc hệ sinh thái LeRobot (LeKiwi), và một phương pháp luận sim-to-real quanh nó: khớp đáp ứng actuator, open-loop replay làm phép chẩn đoán nền tảng — cùng một chuỗi lệnh chạy trên sim và trên robot thật, chồng hai chuỗi trạng thái lên nhau — và các bậc fidelity tường minh để “đủ giống thật” là một ngưỡng được định nghĩa, không phải một cảm giác.',
            'Trên nền twin đó, các policy imitation-learning được huấn luyện trong mô phỏng và đánh giá trên robot vật lý, với mức độ chuyển giao được đo như một chỉ số hạng nhất thay vì nhìn bằng mắt.',
          ],
        },
        {
          heading: 'Vai trò của tôi',
          body: [
            'Tech lead: thiết kế phương pháp luận và các cổng đánh giá, dẫn dắt đội xây cả twin lẫn pipeline học.',
          ],
        },
      ],
      stack: [
        'LeKiwi / LeRobot (Hugging Face)',
        'Mô phỏng vật lý',
        'Imitation learning',
        'Chẩn đoán sim2real',
        'Python',
      ],
    },
  ],
};
